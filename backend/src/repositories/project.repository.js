const prisma = require('../lib/prisma');

const findAll = async ({ page = 1, limit = 10, department, status, agency, year, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
  const skip = (page - 1) * limit;

  const where = { isDeleted: false };

  if (department) where.department = department;
  if (agency) where.fundingAgency = agency;
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
      { department: { contains: search, mode: 'insensitive' } },
      { fundingAgency: { contains: search, mode: 'insensitive' } },
    ];
  }

  const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'startDate', 'sanctionedAmount'];
  const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

  let projects;
  let total;

  if (status) {
    // Fetch all matching (without pagination) to filter by computed status
    projects = await prisma.researchProject.findMany({ where, orderBy: { [orderField]: orderDir } });
    projects = projects.filter(p => computeStatus(p) === status);
    total = projects.length;
    projects = projects.slice(skip, skip + limit);
  } else {
    [projects, total] = await Promise.all([
      prisma.researchProject.findMany({ where, skip, take: limit, orderBy: { [orderField]: orderDir } }),
      prisma.researchProject.count({ where }),
    ]);
  }

  return { projects: projects.map(addStatus), total };
};

const findById = async (id) => {
  const project = await prisma.researchProject.findFirst({ where: { id: Number(id), isDeleted: false } });
  return project ? addStatus(project) : null;
};

const create = async (data) => {
  const project = await prisma.researchProject.create({ data });
  return addStatus(project);
};

const update = async (id, data) => {
  const project = await prisma.researchProject.update({ where: { id: Number(id) }, data });
  return addStatus(project);
};

const softDelete = async (id) => {
  return prisma.researchProject.update({ where: { id: Number(id) }, data: { isDeleted: true } });
};

const getDashboardStats = async () => {
  const [total, byDept, byAgency, totalFunding] = await Promise.all([
    prisma.researchProject.count({ where: { isDeleted: false } }),
    prisma.researchProject.groupBy({ by: ['department'], where: { isDeleted: false }, _count: { id: true } }),
    prisma.researchProject.groupBy({ by: ['fundingAgency'], where: { isDeleted: false, fundingAgency: { not: null } }, _count: { id: true } }),
    prisma.researchProject.aggregate({ where: { isDeleted: false }, _sum: { sanctionedAmount: true } }),
  ]);

  const allProjects = await prisma.researchProject.findMany({
    where: { isDeleted: false },
    select: { startDate: true, endDate: true, principalInvestigator: true, sanctionedAmount: true },
  });

  let ongoing = 0, completed = 0;
  allProjects.forEach(p => {
    const s = computeStatus(p);
    if (s === 'ongoing') ongoing++;
    else if (s === 'completed') completed++;
  });

  // Top faculty by project count
  const facultyMap = {};
  allProjects.forEach(p => {
    if (p.principalInvestigator) {
      facultyMap[p.principalInvestigator] = (facultyMap[p.principalInvestigator] || 0) + 1;
    }
  });
  const topFaculty = Object.entries(facultyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Projects by year
  const yearMap = {};
  allProjects.forEach(p => {
    if (p.startDate) {
      const yr = new Date(p.startDate).getFullYear();
      yearMap[yr] = (yearMap[yr] || 0) + 1;
    }
  });
  const projectsByYear = Object.entries(yearMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, count]) => ({ year: Number(year), count }));

  // Department chart data
  const departmentChart = byDept
    .filter(d => d.department)
    .map(d => ({ department: d.department, count: d._count.id }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const uniqueAgencies = byAgency.filter(a => a.fundingAgency).length;
  const uniqueFaculty = Object.keys(facultyMap).length;

  return {
    total,
    ongoing,
    completed,
    totalFunding: totalFunding._sum.sanctionedAmount || 0,
    uniqueAgencies,
    uniqueFaculty,
    topFaculty,
    projectsByYear,
    departmentChart,
    statusDistribution: [
      { name: 'Ongoing', value: ongoing, color: '#16A34A' },
      { name: 'Completed', value: completed, color: '#6B7280' },
      { name: 'Upcoming', value: total - ongoing - completed, color: '#F59E0B' },
    ],
  };
};

const computeStatus = (project) => {
  if (!project.startDate || !project.endDate) return 'upcoming';
  const now = new Date();
  if (now < new Date(project.startDate)) return 'upcoming';
  if (now > new Date(project.endDate)) return 'completed';
  return 'ongoing';
};

const addStatus = (project) => ({ ...project, status: computeStatus(project) });

module.exports = { findAll, findById, create, update, softDelete, getDashboardStats };
