const service = require('../services/project.service');
const { z } = require('zod');

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  abstract: z.string().optional(),
  department: z.string().optional(),
  fundingAgency: z.string().optional(),
  agencyScientist: z.string().optional(),
  fileNumber: z.string().optional(),
  sanctionedAmount: z.number().optional(),
  startDate: z.string().datetime({ offset: true }).optional().transform(v => v ? new Date(v) : undefined),
  endDate: z.string().datetime({ offset: true }).optional().transform(v => v ? new Date(v) : undefined),
  principalInvestigator: z.string().optional(),
  coPrincipalInvestigator: z.string().optional(),
  teamMembers: z.any().optional(),
  deliverables: z.string().optional(),
  outcomes: z.string().optional(),
  attachments: z.any().optional(),
});

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, department, status, agency, year, search, sortBy, sortOrder } = req.query;
    const result = await service.getAllProjects({
      page: Number(page), limit: Number(limit),
      department, status, agency, year, search, sortBy, sortOrder,
    });
    res.json({
      success: true,
      data: result.projects,
      meta: { page: Number(page), limit: Number(limit), total: result.total },
    });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const project = await service.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    const project = await service.createProject({ ...parsed.data, createdBy: req.user?.id });
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const parsed = projectSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    const project = await service.updateProject(req.params.id, parsed.data);
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await service.deleteProject(req.params.id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) { next(err); }
};

const dashboard = async (req, res, next) => {
  try {
    const stats = await service.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, dashboard };
