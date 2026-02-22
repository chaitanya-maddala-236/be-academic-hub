const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'materials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/materials/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedTypes = /pdf|ppt|pptx|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed (PDF, PPT, DOC, XLS)'));
    }
  }
}).single('file');

// Get all teaching materials
const getAllMaterials = async (req, res) => {
  try {
    const { faculty_id, department, course_name, material_type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT tm.*, f.name as faculty_name, f.department as faculty_department
      FROM teaching_materials tm
      LEFT JOIN faculty f ON tm.faculty_id = f.id
      WHERE 1=1
    `;
    let countQueryText = `
      SELECT COUNT(*)
      FROM teaching_materials tm
      LEFT JOIN faculty f ON tm.faculty_id = f.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (faculty_id) {
      const condition = ` AND tm.faculty_id = $${paramCount}`;
      queryText += condition;
      countQueryText += condition;
      queryParams.push(faculty_id);
      paramCount++;
    }

    if (department) {
      const condition = ` AND tm.department = $${paramCount}`;
      queryText += condition;
      countQueryText += condition;
      queryParams.push(department);
      paramCount++;
    }

    if (course_name) {
      const condition = ` AND tm.course_name ILIKE $${paramCount}`;
      queryText += condition;
      countQueryText += condition;
      queryParams.push(`%${course_name}%`);
      paramCount++;
    }

    if (material_type) {
      const condition = ` AND tm.material_type = $${paramCount}`;
      queryText += condition;
      countQueryText += condition;
      queryParams.push(material_type);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(countQueryText, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    queryText += ` ORDER BY tm.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryText, queryParams);

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
    console.error('Error fetching teaching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teaching materials',
      error: error.message
    });
  }
};

// Get single teaching material
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT tm.*, f.name as faculty_name, f.department as faculty_department
       FROM teaching_materials tm
       LEFT JOIN faculty f ON tm.faculty_id = f.id
       WHERE tm.id = $1`,
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
    console.error('Error fetching teaching material:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teaching material',
      error: error.message
    });
  }
};

// Create teaching material
const createMaterial = async (req, res) => {
  try {
    const {
      title,
      faculty_id,
      department,
      course_name,
      material_type,
      video_link,
      description
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const file_url = req.file ? `/uploads/materials/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO teaching_materials 
       (title, faculty_id, department, course_name, material_type, file_url, video_link, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, faculty_id, department, course_name, material_type, file_url, video_link, description, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Teaching material created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating teaching material:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating teaching material',
      error: error.message
    });
  }
};

// Delete teaching material
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the material to check ownership and get file path
    const checkResult = await pool.query(
      'SELECT * FROM teaching_materials WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teaching material not found'
      });
    }

    const material = checkResult.rows[0];

    // Check ownership for faculty members (admins can delete any)
    if (req.user.role === 'faculty' && material.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own materials'
      });
    }

    // Delete from database
    await pool.query(
      'DELETE FROM teaching_materials WHERE id = $1',
      [id]
    );

    // Delete associated file if it exists
    if (material.file_url) {
      const filePath = path.join(__dirname, '..', material.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Teaching material deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting teaching material:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting teaching material',
      error: error.message
    });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  deleteMaterial,
  upload
};
