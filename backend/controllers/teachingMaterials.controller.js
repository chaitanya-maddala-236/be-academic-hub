const pool = require('../config/db');

// Get all teaching materials with filters and pagination
const getAllTeachingMaterials = async (req, res, next) => {
  try {
    const { material_type, faculty_id, department, course_name, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM teaching_materials WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (material_type) {
      query += ` AND material_type = $${paramIndex}`;
      params.push(material_type);
      paramIndex++;
    }

    if (faculty_id) {
      query += ` AND faculty_id = $${paramIndex}`;
      params.push(faculty_id);
      paramIndex++;
    }

    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (course_name) {
      query += ` AND course_name ILIKE $${paramIndex}`;
      params.push(`%${course_name}%`);
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

// Get single teaching material
const getTeachingMaterialById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM teaching_materials WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teaching material not found'
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

// Create teaching material
const createTeachingMaterial = async (req, res, next) => {
  try {
    const {
      title,
      description,
      material_type,
      file_url,
      video_link,
      faculty_id,
      course_name,
      department
    } = req.body;

    const result = await pool.query(
      `INSERT INTO teaching_materials 
       (title, description, material_type, file_url, video_link, faculty_id, course_name, department, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, material_type, file_url, video_link, faculty_id, course_name, department, req.user?.id]
    );

    res.status(201).json({
      success: true,
      message: 'Teaching material created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update teaching material
const updateTeachingMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      material_type,
      file_url,
      video_link,
      faculty_id,
      course_name,
      department
    } = req.body;

    const result = await pool.query(
      `UPDATE teaching_materials
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           material_type = COALESCE($3, material_type),
           file_url = COALESCE($4, file_url),
           video_link = COALESCE($5, video_link),
           faculty_id = COALESCE($6, faculty_id),
           course_name = COALESCE($7, course_name),
           department = COALESCE($8, department),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, description, material_type, file_url, video_link, faculty_id, course_name, department, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teaching material not found'
      });
    }

    res.json({
      success: true,
      message: 'Teaching material updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete teaching material
const deleteTeachingMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM teaching_materials WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teaching material not found'
      });
    }

    res.json({
      success: true,
      message: 'Teaching material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTeachingMaterials,
  getTeachingMaterialById,
  createTeachingMaterial,
  updateTeachingMaterial,
  deleteTeachingMaterial
};
