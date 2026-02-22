const pool = require('../config/db');

// Get projects grouped by department
const getProjectsByDepartment = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT department, COUNT(*) AS count
      FROM funded_projects
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        department: row.department,
        count: parseInt(row.count),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get funding trend grouped by year
const getFundingTrend = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT EXTRACT(YEAR FROM start_date)::INT AS year,
             COALESCE(SUM(sanctioned_amount), 0)::FLOAT AS total_funding,
             COUNT(*) AS project_count
      FROM funded_projects
      WHERE start_date IS NOT NULL
      GROUP BY year
      ORDER BY year ASC
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        year: row.year,
        total_funding: row.total_funding,
        project_count: parseInt(row.project_count),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get status distribution
const getStatusDistribution = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT start_date, end_date FROM funded_projects WHERE start_date IS NOT NULL AND end_date IS NOT NULL'
    );

    const now = new Date();
    const counts = { ongoing: 0, completed: 0, upcoming: 0 };

    result.rows.forEach(({ start_date, end_date }) => {
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (now < start) {
        counts.upcoming += 1;
      } else if (now > end) {
        counts.completed += 1;
      } else {
        counts.ongoing += 1;
      }
    });

    res.json({
      success: true,
      data: Object.entries(counts).map(([status, count]) => ({ status, count })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectsByDepartment,
  getFundingTrend,
  getStatusDistribution,
};
