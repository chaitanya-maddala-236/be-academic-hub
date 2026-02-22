const pool = require('../config/db');

// Get all IP assets with filters and pagination
const getAllIpAssets = async (req, res, next) => {
  try {
    const { type, department, commercialized, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM ip_assets WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (commercialized !== undefined) {
      query += ` AND commercialized = $${paramIndex}`;
      params.push(commercialized === 'true');
      paramIndex++;
    }

    if (year) {
      query += ` AND filing_year = $${paramIndex}`;
      params.push(year);
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

// Get single IP asset
const getIpAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM ip_assets WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'IP asset not found'
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

// Create IP asset
const createIpAsset = async (req, res, next) => {
  try {
    const {
      name,
      type,
      owner,
      inventors,
      department,
      filing_year,
      filing_date,
      published_date,
      granted_date,
      expiry_date,
      status,
      application_number,
      registration_number,
      description,
      pdf_url,
      commercialized,
      faculty_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO ip_assets 
       (name, type, owner, inventors, department, filing_year, filing_date, published_date, 
        granted_date, expiry_date, status, application_number, registration_number, description, 
        pdf_url, commercialized, faculty_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [name, type, owner, inventors, department, filing_year, filing_date, published_date,
       granted_date, expiry_date, status, application_number, registration_number, description,
       pdf_url, commercialized || false, faculty_id, req.user?.id || null]
    );

    res.status(201).json({
      success: true,
      message: 'IP asset created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update IP asset
const updateIpAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      owner,
      inventors,
      department,
      filing_year,
      filing_date,
      published_date,
      granted_date,
      expiry_date,
      status,
      application_number,
      registration_number,
      description,
      pdf_url,
      commercialized,
      faculty_id
    } = req.body;

    const result = await pool.query(
      `UPDATE ip_assets
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           owner = COALESCE($3, owner),
           inventors = COALESCE($4, inventors),
           department = COALESCE($5, department),
           filing_year = COALESCE($6, filing_year),
           filing_date = COALESCE($7, filing_date),
           published_date = COALESCE($8, published_date),
           granted_date = COALESCE($9, granted_date),
           expiry_date = COALESCE($10, expiry_date),
           status = COALESCE($11, status),
           application_number = COALESCE($12, application_number),
           registration_number = COALESCE($13, registration_number),
           description = COALESCE($14, description),
           pdf_url = COALESCE($15, pdf_url),
           commercialized = COALESCE($16, commercialized),
           faculty_id = COALESCE($17, faculty_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $18
       RETURNING *`,
      [name, type, owner, inventors, department, filing_year, filing_date, published_date,
       granted_date, expiry_date, status, application_number, registration_number, description,
       pdf_url, commercialized, faculty_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'IP asset not found'
      });
    }

    res.json({
      success: true,
      message: 'IP asset updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete IP asset
const deleteIpAsset = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM ip_assets WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'IP asset not found'
      });
    }

    res.json({
      success: true,
      message: 'IP asset deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIpAssets,
  getIpAssetById,
  createIpAsset,
  updateIpAsset,
  deleteIpAsset
};
