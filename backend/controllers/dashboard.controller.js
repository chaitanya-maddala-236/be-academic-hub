const pool = require('../config/db');

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    // Total projects
    const projectsResult = await pool.query('SELECT COUNT(*) as total FROM funded_projects');
    const totalProjects = parseInt(projectsResult.rows[0].total);

    // Total funding
    const fundingResult = await pool.query('SELECT COALESCE(SUM(amount_sanctioned), 0) as total FROM funded_projects');
    const totalFunding = parseFloat(fundingResult.rows[0].total);

    // Total publications
    const publicationsResult = await pool.query('SELECT COUNT(*) as total FROM publications');
    const totalPublications = parseInt(publicationsResult.rows[0].total);

    // Total patents/IPR
    const iprResult = await pool.query('SELECT COUNT(*) as total FROM ipr');
    const totalIPR = parseInt(iprResult.rows[0].total);

    // Total consultancy revenue
    const consultancyResult = await pool.query('SELECT COALESCE(SUM(amount_earned), 0) as total FROM consultancy');
    const totalConsultancyRevenue = parseFloat(consultancyResult.rows[0].total);

    // Publications per year (last 5 years)
    const publicationsPerYear = await pool.query(`
      SELECT year, COUNT(*) as count
      FROM publications
      WHERE year >= EXTRACT(YEAR FROM CURRENT_DATE) - 5
      GROUP BY year
      ORDER BY year DESC
    `);

    // IPR growth (last 5 years)
    const iprGrowth = await pool.query(`
      SELECT EXTRACT(YEAR FROM filing_date) as year, COUNT(*) as count
      FROM ipr
      WHERE filing_date >= CURRENT_DATE - INTERVAL '5 years'
      GROUP BY year
      ORDER BY year DESC
    `);

    // Department-wise statistics
    const departmentStats = await pool.query(`
      SELECT 
        depts.department,
        COUNT(DISTINCT fp.id) as projects,
        COALESCE(SUM(fp.amount_sanctioned), 0) as funding,
        COUNT(DISTINCT p.id) as publications,
        COUNT(DISTINCT i.id) as ipr
      FROM (SELECT DISTINCT department FROM funded_projects 
            UNION SELECT DISTINCT department FROM publications 
            UNION SELECT DISTINCT department FROM ipr) as depts
      LEFT JOIN funded_projects fp ON fp.department = depts.department
      LEFT JOIN publications p ON p.department = depts.department
      LEFT JOIN ipr i ON i.department = depts.department
      GROUP BY depts.department
      ORDER BY funding DESC
    `);

    res.json({
      success: true,
      data: {
        summary: {
          totalProjects,
          totalFunding,
          totalPublications,
          totalIPR,
          totalConsultancyRevenue
        },
        publicationsPerYear: publicationsPerYear.rows,
        iprGrowth: iprGrowth.rows,
        departmentStats: departmentStats.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get publications per year chart data
const getPublicationsPerYear = async (req, res, next) => {
  try {
    const { years = 5 } = req.query;

    const result = await pool.query(`
      SELECT year, COUNT(*) as count
      FROM publications
      WHERE year >= EXTRACT(YEAR FROM CURRENT_DATE) - $1
      GROUP BY year
      ORDER BY year ASC
    `, [years]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get patent growth chart data
const getPatentGrowth = async (req, res, next) => {
  try {
    const { years = 5 } = req.query;
    
    // Calculate the date threshold in JavaScript to avoid SQL injection
    const dateThreshold = new Date();
    dateThreshold.setFullYear(dateThreshold.getFullYear() - parseInt(years));

    const result = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM filing_date) as year,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'granted' THEN 1 ELSE 0 END) as granted
      FROM ipr
      WHERE filing_date >= $1
      AND ipr_type = 'patent'
      GROUP BY year
      ORDER BY year ASC
    `, [dateThreshold]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get consultancy revenue by year
const getConsultancyRevenue = async (req, res, next) => {
  try {
    const { years = 5 } = req.query;
    
    // Calculate the date threshold in JavaScript to avoid SQL injection
    const dateThreshold = new Date();
    dateThreshold.setFullYear(dateThreshold.getFullYear() - parseInt(years));

    const result = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM start_date) as year,
        COALESCE(SUM(amount_earned), 0) as revenue,
        COUNT(*) as count
      FROM consultancy
      WHERE start_date >= $1
      GROUP BY year
      ORDER BY year ASC
    `, [dateThreshold]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get department comparison
const getDepartmentComparison = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(fp.department, p.department, i.department, c.department) as department,
        COUNT(DISTINCT fp.id) as projects,
        COALESCE(SUM(fp.amount_sanctioned), 0) as funding,
        COUNT(DISTINCT p.id) as publications,
        COUNT(DISTINCT i.id) as ipr,
        COALESCE(SUM(c.amount_earned), 0) as consultancy_revenue
      FROM funded_projects fp
      FULL OUTER JOIN publications p ON fp.department = p.department
      FULL OUTER JOIN ipr i ON COALESCE(fp.department, p.department) = i.department
      FULL OUTER JOIN consultancy c ON COALESCE(fp.department, p.department, i.department) = c.department
      WHERE COALESCE(fp.department, p.department, i.department, c.department) IS NOT NULL
      GROUP BY COALESCE(fp.department, p.department, i.department, c.department)
      ORDER BY funding DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPublicationsPerYear,
  getPatentGrowth,
  getConsultancyRevenue,
  getDepartmentComparison
};
