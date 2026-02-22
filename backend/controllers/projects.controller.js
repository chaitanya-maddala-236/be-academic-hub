const prisma = require('../src/lib/prisma');

// Helper function to calculate project status
const calculateProjectStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return 'upcoming';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'upcoming';
  } else if (now > end) {
    return 'completed';
  } else {
    return 'ongoing';
  }
};

// Get all projects with filters and pagination
const getAllProjects = async (req, res, next) => {
  try {
    const { status, department, funding_agency, year, search, funded, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (department) where.department = department;
    if (funding_agency) where.fundingAgency = funding_agency;
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
      ];
    }
    if (funded === 'true') {
      where.fundingAgency = { not: null };
    }

    let projects;
    let total;

    if (status) {
      // Fetch all to filter by computed status
      const all = await prisma.researchProject.findMany({
        where,
        orderBy: { startDate: 'desc' },
      });
      const filtered = all.filter(p => calculateProjectStatus(p.startDate, p.endDate) === status);
      total = filtered.length;
      projects = filtered.slice(skip, skip + parseInt(limit));
    } else {
      [projects, total] = await Promise.all([
        prisma.researchProject.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { startDate: 'desc' },
        }),
        prisma.researchProject.count({ where }),
      ]);
    }

    const projectsWithStatus = projects.map(project => ({
      ...project,
      status: calculateProjectStatus(project.startDate, project.endDate),
    }));

    res.json({
      success: true,
      data: projectsWithStatus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.researchProject.findFirst({
      where: { id: parseInt(id) },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: { ...project, status: calculateProjectStatus(project.startDate, project.endDate) },
    });
  } catch (error) {
    next(error);
  }
};

// Create project
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      principal_investigator,
      co_principal_investigator,
      department,
      funding_agency,
      agency_scientist,
      file_number,
      sanctioned_amount,
      funds_per_year,
      start_date,
      end_date,
      objectives,
      deliverables,
      outcomes,
      team,
      pdf_url,
    } = req.body;

    const project = await prisma.researchProject.create({
      data: {
        title,
        principalInvestigator: principal_investigator,
        coPrincipalInvestigator: co_principal_investigator,
        department,
        fundingAgency: funding_agency,
        agencyScientist: agency_scientist,
        fileNumber: file_number,
        sanctionedAmount: sanctioned_amount ? parseFloat(sanctioned_amount) : null,
        startDate: start_date ? new Date(start_date) : null,
        endDate: end_date ? new Date(end_date) : null,
        deliverables,
        outcomes,
        attachments: pdf_url ? { pdf_url } : null,
        createdBy: req.user?.id || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { ...project, status: calculateProjectStatus(project.startDate, project.endDate) },
    });
  } catch (error) {
    next(error);
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      principal_investigator,
      co_principal_investigator,
      department,
      funding_agency,
      agency_scientist,
      file_number,
      sanctioned_amount,
      funds_per_year,
      start_date,
      end_date,
      objectives,
      deliverables,
      outcomes,
      team,
      pdf_url,
    } = req.body;

    const existing = await prisma.researchProject.findFirst({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = await prisma.researchProject.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(principal_investigator !== undefined && { principalInvestigator: principal_investigator }),
        ...(co_principal_investigator !== undefined && { coPrincipalInvestigator: co_principal_investigator }),
        ...(department !== undefined && { department }),
        ...(funding_agency !== undefined && { fundingAgency: funding_agency }),
        ...(agency_scientist !== undefined && { agencyScientist: agency_scientist }),
        ...(file_number !== undefined && { fileNumber: file_number }),
        ...(sanctioned_amount !== undefined && { sanctionedAmount: parseFloat(sanctioned_amount) }),
        ...(start_date !== undefined && { startDate: new Date(start_date) }),
        ...(end_date !== undefined && { endDate: new Date(end_date) }),
        ...(deliverables !== undefined && { deliverables }),
        ...(outcomes !== undefined && { outcomes }),
      },
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { ...project, status: calculateProjectStatus(project.startDate, project.endDate) },
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.researchProject.findFirst({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await prisma.researchProject.delete({ where: { id: parseInt(id) } });

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
