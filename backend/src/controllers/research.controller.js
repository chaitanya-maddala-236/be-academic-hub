const pool = require('../../config/db');
const prisma = require('../lib/prisma');

// Helper: compute project status from dates
const computeStatus = (project) => {
  if (!project.startDate || !project.endDate) return 'upcoming';
  const now = new Date();
  if (now < new Date(project.startDate)) return 'upcoming';
  if (now > new Date(project.endDate)) return 'completed';
  return 'ongoing';
};

/**
 * GET /api/v1/research
 * Returns combined publications + projects.
 * Query params: type (publication|project|all), department, year, status, indexing, search, page, limit
 */
const getResearch = async (req, res, next) => {
  try {
    const {
      type = 'all',
      department,
      year,
      status,
      indexing,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const items = [];

    // ── Fetch publications (legacy pool) ────────────────────────────────────
    // TODO: Replace with Prisma/MongoDB once publications are migrated
    if (type === 'all' || type === 'publication') {
      let query = `
        SELECT p.id, p.title, p.authors, p.journal_name, p.publication_type,
               p.year, p.indexing, p.doi, p.abstract, p.national_international,
               p.pdf_url, p.created_at,
               f.name as faculty_name, f.department
        FROM publications p
        LEFT JOIN faculty f ON p.faculty_id = f.id
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;

      if (department) { query += ` AND f.department = $${idx++}`; params.push(department); }
      if (year) { query += ` AND p.year = $${idx++}`; params.push(Number(year)); }
      if (indexing) { query += ` AND p.indexing ILIKE $${idx++}`; params.push(`%${indexing}%`); }
      if (search) {
        // Escape special ILIKE pattern characters to prevent pattern injection
        const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
        query += ` AND (p.title ILIKE $${idx} OR p.authors ILIKE $${idx} OR f.name ILIKE $${idx})`;
        params.push(`%${escapedSearch}%`);
        idx++;
      }

      query += ` ORDER BY p.year DESC, p.created_at DESC`;

      const result = await pool.query(query, params);
      result.rows.forEach((pub) => {
        items.push({
          recordType: 'publication',
          id: pub.id,
          title: pub.title,
          department: pub.department || null,
          year: pub.year,
          authors: pub.authors || null,
          journal: pub.journal_name || null,
          publicationType: pub.publication_type || null,
          indexing: pub.indexing ? [pub.indexing] : [],
          doi: pub.doi || null,
          abstract: pub.abstract || null,
          scope: pub.national_international || null,
          facultyName: pub.faculty_name || null,
          pdfUrl: pub.pdf_url || null,
          createdAt: pub.created_at,
        });
      });
    }

    // ── Fetch projects (Prisma) ──────────────────────────────────────────────
    // TODO: Replace with MongoDB/Prisma once fully migrated
    if (type === 'all' || type === 'project') {
      const where = { isDeleted: false };
      if (department) where.department = department;
      if (year) {
        where.startDate = {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        };
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { principalInvestigator: { contains: search, mode: 'insensitive' } },
          { fundingAgency: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
        ];
      }

      let projects = await prisma.researchProject.findMany({ where, orderBy: { createdAt: 'desc' } });

      projects = projects.map((p) => ({ ...p, status: computeStatus(p) }));

      // Status filter applied after compute (status is derived, not stored)
      if (status) projects = projects.filter((p) => p.status === status);

      projects.forEach((p) => {
        items.push({
          recordType: 'project',
          id: p.id,
          title: p.title,
          department: p.department || null,
          year: p.startDate ? new Date(p.startDate).getFullYear() : null,
          agency: p.fundingAgency || null,
          pi: p.principalInvestigator || null,
          coPi: p.coPrincipalInvestigator || null,
          amount: p.sanctionedAmount || null,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          abstract: p.abstract || null,
          outcomes: p.outcomes || null,
          deliverables: p.deliverables || null,
          teamMembers: p.teamMembers || [],
          createdAt: p.createdAt,
        });
      });
    }

    // ── Sort merged list by year desc ────────────────────────────────────────
    items.sort((a, b) => {
      const ya = a.year ?? 0;
      const yb = b.year ?? 0;
      return yb - ya;
    });

    const total = items.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const paginated = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      data: paginated,
      meta: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/research/stats
 * Returns aggregate counts across publications + projects.
 */
const getResearchStats = async (req, res, next) => {
  try {
    // Publications stats (legacy pool)
    // TODO: Replace with Prisma once publications are migrated
    const pubResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN indexing IS NOT NULL AND indexing <> '' THEN 1 END) as indexed,
        array_agg(DISTINCT f.department) FILTER (WHERE f.department IS NOT NULL) as pub_departments
      FROM publications p
      LEFT JOIN faculty f ON p.faculty_id = f.id
    `);
    const pubRow = pubResult.rows[0];
    const pubDepts= pubRow.pub_departments ?? [];

    // Projects stats (Prisma)
    const [totalProjects, allProjects] = await Promise.all([
      prisma.researchProject.count({ where: { isDeleted: false } }),
      prisma.researchProject.findMany({
        where: { isDeleted: false },
        select: { startDate: true, endDate: true, department: true },
      }),
    ]);

    const now = new Date();
    let activeProjects = 0;
    const deptSet = new Set();

    allProjects.forEach((p) => {
      if (p.startDate && p.endDate) {
        if (now >= new Date(p.startDate) && now <= new Date(p.endDate)) activeProjects++;
      }
      if (p.department) deptSet.add(p.department);
    });

    // Union publication + project departments for accurate unique count
    pubDepts.forEach((d) => deptSet.add(d));

    res.json({
      success: true,
      data: {
        totalPublications: Number(pubRow.total),
        indexedPublications: Number(pubRow.indexed),
        totalProjects,
        activeProjects,
        departments: deptSet.size,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResearch, getResearchStats };
