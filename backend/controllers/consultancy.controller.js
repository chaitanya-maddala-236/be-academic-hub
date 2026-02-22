const pool = require('../config/db');

// Get all consultancy records
const getAllConsultancy = async (req, res) => {
  try {
    const { department, status, faculty_id, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT c.*, f.name as faculty_name, f.department as faculty_department
      FROM consultancy c
      LEFT JOIN faculty f ON c.faculty_id = f.id
      WHERE 1=1
    `;
    let countQueryText = `
      SELECT COUNT(*)
      FROM consultancy c
      LEFT JOIN faculty f ON c.faculty_id = f.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (department) {
      const condition = ` AND c.department = $${paramCount}`;
      queryText += condition;
      countQueryText += condition;
      queryParams.push(department);
      paramCount++;
    }

    if (status) {
      const condition = ` AND c.status = $${paramCount}`;
      queryText += condition;
      countQueryText += condition;
      queryParams.push(status);
      paramCount++;
    }

    if (faculty_id) {
      const condition = ` AND c.faculty_id = $${paramCount}`;
      queryText += condition;
      countQueryText += condition;
      queryParams.push(faculty_id);
      paramCount++;
    }

    if (year) {
      const condition = ` AND EXTRACT(YEAR FROM c.start_date) = $${paramCount}`;
      queryText += condition;
      countQueryText += condition;
      queryParams.push(year);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(countQueryText, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    queryText += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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
    console.error('Error fetching consultancy records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultancy records',
      error: error.message
    });
  }
};

// Get single consultancy record
const getConsultancyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, f.name as faculty_name, f.department as faculty_department
       FROM consultancy c
       LEFT JOIN faculty f ON c.faculty_id = f.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultancy record not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching consultancy record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultancy record',
      error: error.message
    });
  }
};

// Create consultancy record
const createConsultancy = async (req, res) => {
  try {
    const {
      title,
      faculty_id,
      client_name,
      department,
      amount_earned,
      start_date,
      end_date,
      description,
      status
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const result = await pool.query(
      `INSERT INTO consultancy 
       (title, faculty_id, client_name, department, amount_earned, start_date, end_date, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, faculty_id, client_name, department, amount_earned, start_date, end_date, description, status, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Consultancy record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating consultancy record:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating consultancy record',
      error: error.message
    });
  }
};

// Update consultancy record
const updateConsultancy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      faculty_id,
      client_name,
      department,
      amount_earned,
      start_date,
      end_date,
      description,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE consultancy 
       SET title = COALESCE($1, title),
           faculty_id = COALESCE($2, faculty_id),
           client_name = COALESCE($3, client_name),
           department = COALESCE($4, department),
           amount_earned = COALESCE($5, amount_earned),
           start_date = COALESCE($6, start_date),
           end_date = COALESCE($7, end_date),
           description = COALESCE($8, description),
           status = COALESCE($9, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [title, faculty_id, client_name, department, amount_earned, start_date, end_date, description, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultancy record not found'
      });
    }

    res.json({
      success: true,
      message: 'Consultancy record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating consultancy record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating consultancy record',
      error: error.message
    });
  }
};

// Delete consultancy record
const deleteConsultancy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM consultancy WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultancy record not found'
      });
    }

    res.json({
      success: true,
      message: 'Consultancy record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting consultancy record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting consultancy record',
      error: error.message
    });
  }
};

module.exports = {
  getAllConsultancy,
  getConsultancyById,
  createConsultancy,
  updateConsultancy,
  deleteConsultancy
};
