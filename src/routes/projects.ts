import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  restoreProject,
} from '../controllers/projectController';
import authMiddleware from '../middleware/authMiddleware';
import {
  createProjectValidation,
  updateProjectValidation,
  getProjectByIdValidation,
} from '../validation/projectValidation'; // Adjust the import path

const router = express.Router();

router.post('/', authMiddleware(['ADMIN']), createProjectValidation, createProject);
router.get('/', authMiddleware(['ADMIN', 'MANAGER', 'EMPLOYEE']), getProjects);
router.get('/:id', authMiddleware(['ADMIN', 'MANAGER', 'EMPLOYEE']), getProjectByIdValidation, getProjectById);
router.put('/:id', authMiddleware(['ADMIN']), updateProjectValidation, updateProject);
router.delete('/:id', authMiddleware(['ADMIN']), deleteProject);
router.patch('/restore/:id', authMiddleware(['ADMIN']), restoreProject);

export default router;
