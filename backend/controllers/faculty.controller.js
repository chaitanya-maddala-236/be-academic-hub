const pool = require('../config/db');

// Get all faculty with filters and pagination
const getAllFaculty = async (req, res, next) => {
  try {
    const { department, search, page = 1, limit = 10, sortByPublications } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT f.*, 
        COUNT(DISTINCT p.id) as publications_count,
        COUNT(DISTINCT pa.id) as patents_count
      FROM faculty f
      LEFT JOIN publications p ON f.id = p.faculty_id
      LEFT JOIN patents pa ON f.id = pa.faculty_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (department) {
      query += ` AND f.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (search) {
      query += ` AND f.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' GROUP BY f.id';

    // Apply sorting
    if (sortByPublications === 'true') {
      query += ' ORDER BY publications_count DESC';
    } else {
      query += ' ORDER BY f.created_at DESC';
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Apply pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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

// Get single faculty with relationships
const getFacultyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get faculty details
    const facultyResult = await pool.query(
      'SELECT * FROM faculty WHERE id = $1',
      [id]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    const faculty = facultyResult.rows[0];

    // Get publications
    const publicationsResult = await pool.query(
      'SELECT * FROM publications WHERE faculty_id = $1 ORDER BY year DESC',
      [id]
    );

    // Get patents
    const patentsResult = await pool.query(
      'SELECT * FROM patents WHERE faculty_id = $1 ORDER BY filing_date DESC',
      [id]
    );

    // Get projects (matching by principal_investigator name)
    const projectsResult = await pool.query(
      'SELECT * FROM funded_projects WHERE principal_investigator = $1 ORDER BY start_date DESC',
      [faculty.name]
    );

    res.json({
      success: true,
      data: {
        ...faculty,
        publications: publicationsResult.rows,
        patents: patentsResult.rows,
        projects: projectsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create faculty
const createFaculty = async (req, res, next) => {
  try {
    const { name, designation, department, specialization, bio, email, profile_image } = req.body;

    // Handle file upload if present
    let profileImagePath = profile_image;
    if (req.file) {
      profileImagePath = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `INSERT INTO faculty (name, designation, department, specialization, bio, email, profile_image, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, designation, department, specialization, bio, email, profileImagePath, req.user?.id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update faculty
const updateFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, designation, department, specialization, bio, email, profile_image } = req.body;

    // Handle file upload if present
    let profileImagePath = profile_image;
    if (req.file) {
      profileImagePath = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE faculty 
       SET name = COALESCE($1, name),
           designation = COALESCE($2, designation),
           department = COALESCE($3, department),
           specialization = COALESCE($4, specialization),
           bio = COALESCE($5, bio),
           email = COALESCE($6, email),
           profile_image = COALESCE($7, profile_image),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, designation, department, specialization, bio, email, profileImagePath, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete faculty
const deleteFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM faculty WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
};
