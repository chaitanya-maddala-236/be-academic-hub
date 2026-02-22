const repo = require('../repositories/project.repository');

const getAllProjects = (filters) => repo.findAll(filters);
const getProjectById = (id) => repo.findById(id);
const createProject = (data) => repo.create(data);
const updateProject = (id, data) => repo.update(id, data);
const deleteProject = (id) => repo.softDelete(id);
const getDashboardStats = () => repo.getDashboardStats();

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject, getDashboardStats };
