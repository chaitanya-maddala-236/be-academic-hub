const pool = require('../config/db');

// Get all labs with filters and pagination
const getAllLabs = async (req, res, next) => {
  try {
    const { department, research_area, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM research_labs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (research_area) {
      query += ` AND $${paramIndex} = ANY(focus_areas)`;
      params.push(research_area);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination and sorting
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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

// Get single lab
const getLabById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM research_labs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research lab not found'
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

// Create lab
const createLab = async (req, res, next) => {
  try {
    const {
      name,
      department,
      head,
      description,
      focus_areas,
      established_year,
      image_url
    } = req.body;

    // Handle file upload if present
    let imagePath = image_url;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `INSERT INTO research_labs 
       (name, department, head, description, focus_areas, established_year, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, department, head, description, focus_areas, established_year, imagePath, req.user?.id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Research lab created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update lab
const updateLab = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      department,
      head,
      description,
      focus_areas,
      established_year,
      image_url
    } = req.body;

    // Handle file upload if present
    let imagePath = image_url;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE research_labs
       SET name = COALESCE($1, name),
           department = COALESCE($2, department),
           head = COALESCE($3, head),
           description = COALESCE($4, description),
           focus_areas = COALESCE($5, focus_areas),
           established_year = COALESCE($6, established_year),
           image_url = COALESCE($7, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, department, head, description, focus_areas, established_year, imagePath, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research lab not found'
      });
    }

    res.json({
      success: true,
      message: 'Research lab updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete lab
const deleteLab = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM research_labs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research lab not found'
      });
    }

    res.json({
      success: true,
      message: 'Research lab deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab
};
