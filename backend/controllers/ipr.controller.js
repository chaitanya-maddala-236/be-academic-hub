const pool = require('../config/db');

// Get all IPR with filters and pagination
const getAllIPR = async (req, res, next) => {
  try {
    const { type, status, department, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM ipr WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (type) {
      query += ` AND ipr_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (year) {
      query += ` AND EXTRACT(YEAR FROM filing_date) = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and sorting
    query += ` ORDER BY filing_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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

// Get single IPR
const getIPRById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM ipr WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'IPR not found'
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

// Create IPR
const createIPR = async (req, res, next) => {
  try {
    const {
      title,
      ipr_type,
      application_number,
      status,
      filing_date,
      publication_date,
      grant_date,
      inventors,
      faculty_id,
      department,
      description,
      pdf_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO ipr 
       (title, ipr_type, application_number, status, filing_date, publication_date, grant_date, inventors, faculty_id, department, description, pdf_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [title, ipr_type, application_number, status, filing_date, publication_date, grant_date, inventors, faculty_id, department, description, pdf_url, req.user?.id]
    );

    res.status(201).json({
      success: true,
      message: 'IPR created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update IPR
const updateIPR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      ipr_type,
      application_number,
      status,
      filing_date,
      publication_date,
      grant_date,
      inventors,
      faculty_id,
      department,
      description,
      pdf_url
    } = req.body;

    const result = await pool.query(
      `UPDATE ipr
       SET title = COALESCE($1, title),
           ipr_type = COALESCE($2, ipr_type),
           application_number = COALESCE($3, application_number),
           status = COALESCE($4, status),
           filing_date = COALESCE($5, filing_date),
           publication_date = COALESCE($6, publication_date),
           grant_date = COALESCE($7, grant_date),
           inventors = COALESCE($8, inventors),
           faculty_id = COALESCE($9, faculty_id),
           department = COALESCE($10, department),
           description = COALESCE($11, description),
           pdf_url = COALESCE($12, pdf_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [title, ipr_type, application_number, status, filing_date, publication_date, grant_date, inventors, faculty_id, department, description, pdf_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'IPR not found'
      });
    }

    res.json({
      success: true,
      message: 'IPR updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete IPR
const deleteIPR = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM ipr WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'IPR not found'
      });
    }

    res.json({
      success: true,
      message: 'IPR deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIPR,
  getIPRById,
  createIPR,
  updateIPR,
  deleteIPR
};
