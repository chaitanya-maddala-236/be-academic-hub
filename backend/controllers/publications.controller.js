const pool = require('../config/db');

// Get all publications with filters and pagination
const getAllPublications = async (req, res, next) => {
  try {
    const {
      year,
      publication_type,
      department,
      indexing,
      search,
      faculty_id,
      page = 1,
      limit = 10
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, f.name as faculty_name, f.department
      FROM publications p
      LEFT JOIN faculty f ON p.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (year) {
      query += ` AND p.year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (publication_type) {
      query += ` AND p.publication_type = $${paramIndex}`;
      params.push(publication_type);
      paramIndex++;
    }

    if (department) {
      query += ` AND f.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (indexing) {
      query += ` AND p.indexing = $${paramIndex}`;
      params.push(indexing);
      paramIndex++;
    }

    if (search) {
      query += ` AND p.title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (faculty_id) {
      query += ` AND p.faculty_id = $${paramIndex}`;
      params.push(faculty_id);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and sorting
    query += ` ORDER BY p.year DESC, p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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

// Get single publication
const getPublicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, f.name as faculty_name, f.department
       FROM publications p
       LEFT JOIN faculty f ON p.faculty_id = f.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
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

// Create publication
const createPublication = async (req, res, next) => {
  try {
    const {
      title,
      journal_name,
      publication_type,
      year,
      indexing,
      national_international,
      faculty_id,
      pdf_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO publications 
       (title, journal_name, publication_type, year, indexing, national_international, faculty_id, pdf_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, journal_name, publication_type, year, indexing, national_international, faculty_id, pdf_url, req.user?.id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Publication created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update publication
const updatePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      journal_name,
      publication_type,
      year,
      indexing,
      national_international,
      faculty_id,
      pdf_url
    } = req.body;

    const result = await pool.query(
      `UPDATE publications
       SET title = COALESCE($1, title),
           journal_name = COALESCE($2, journal_name),
           publication_type = COALESCE($3, publication_type),
           year = COALESCE($4, year),
           indexing = COALESCE($5, indexing),
           national_international = COALESCE($6, national_international),
           faculty_id = COALESCE($7, faculty_id),
           pdf_url = COALESCE($8, pdf_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, journal_name, publication_type, year, indexing, national_international, faculty_id, pdf_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    res.json({
      success: true,
      message: 'Publication updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete publication
const deletePublication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM publications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    res.json({
      success: true,
      message: 'Publication deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication
};
