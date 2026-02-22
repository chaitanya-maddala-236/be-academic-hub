const pool = require('../config/db');

// Get all patents with filters and pagination
const getAllPatents = async (req, res, next) => {
  try {
    const { status, year, department, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, f.name as faculty_name
      FROM patents p
      LEFT JOIN faculty f ON p.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (year) {
      query += ` AND EXTRACT(YEAR FROM p.filing_date) = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (department) {
      query += ` AND p.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (search) {
      query += ` AND p.title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and sorting
    query += ` ORDER BY p.filing_date DESC, p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single patent
const getPatentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, f.name as faculty_name
       FROM patents p
       LEFT JOIN faculty f ON p.faculty_id = f.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patent not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Create patent
const createPatent = async (req, res, next) => {
  try {
    const {
      title,
      patent_number,
      inventors,
      department,
      status,
      filing_date,
      grant_date,
      description,
      faculty_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO patents 
       (title, patent_number, inventors, department, status, filing_date, grant_date, description, faculty_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, patent_number, inventors, department, status, filing_date, grant_date, description, faculty_id]
    );

    res.status(201).json({
      success: true,
      message: 'Patent created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update patent
const updatePatent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      patent_number,
      inventors,
      department,
      status,
      filing_date,
      grant_date,
      description,
      faculty_id
    } = req.body;

    const result = await pool.query(
      `UPDATE patents
       SET title = COALESCE($1, title),
           patent_number = COALESCE($2, patent_number),
           inventors = COALESCE($3, inventors),
           department = COALESCE($4, department),
           status = COALESCE($5, status),
           filing_date = COALESCE($6, filing_date),
           grant_date = COALESCE($7, grant_date),
           description = COALESCE($8, description),
           faculty_id = COALESCE($9, faculty_id)
       WHERE id = $10
       RETURNING *`,
      [title, patent_number, inventors, department, status, filing_date, grant_date, description, faculty_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patent not found'
      });
    }

    res.json({
      success: true,
      message: 'Patent updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete patent
const deletePatent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM patents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patent not found'
      });
    }

    res.json({
      success: true,
      message: 'Patent deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatents,
  getPatentById,
  createPatent,
  updatePatent,
  deletePatent
};
