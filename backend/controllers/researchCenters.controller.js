const pool = require('../config/db');

// Get all research centers with filters and pagination
const getAllResearchCenters = async (req, res, next) => {
  try {
    const { department, research_area, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM research_centers WHERE 1=1';
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

// Get single research center
const getResearchCenterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM research_centers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research center not found'
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

// Create research center
const createResearchCenter = async (req, res, next) => {
  try {
    const {
      name,
      description,
      head,
      department,
      established_year,
      focus_areas,
      facilities,
      image_url,
      website_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO research_centers 
       (name, description, head, department, established_year, focus_areas, facilities, image_url, website_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, description, head, department, established_year, focus_areas, facilities, image_url, website_url, req.user?.id]
    );

    res.status(201).json({
      success: true,
      message: 'Research center created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update research center
const updateResearchCenter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      head,
      department,
      established_year,
      focus_areas,
      facilities,
      image_url,
      website_url
    } = req.body;

    const result = await pool.query(
      `UPDATE research_centers
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           head = COALESCE($3, head),
           department = COALESCE($4, department),
           established_year = COALESCE($5, established_year),
           focus_areas = COALESCE($6, focus_areas),
           facilities = COALESCE($7, facilities),
           image_url = COALESCE($8, image_url),
           website_url = COALESCE($9, website_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, description, head, department, established_year, focus_areas, facilities, image_url, website_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research center not found'
      });
    }

    res.json({
      success: true,
      message: 'Research center updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete research center
const deleteResearchCenter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM research_centers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Research center not found'
      });
    }

    res.json({
      success: true,
      message: 'Research center deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResearchCenters,
  getResearchCenterById,
  createResearchCenter,
  updateResearchCenter,
  deleteResearchCenter
};
