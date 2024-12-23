import express from 'express';
import {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  assignProblemToStudents,
  getProblemWithStudents,
  getStudents,
  getProblemWithUnassignedStudents,
  unassignStudents
} from '../controllers/problemController.js';
import { isAdminOrFaculty, isAuthorized } from '../middlewares/auth.js';

const router = express.Router();
router.use(isAuthorized);

// Admin routes
router.post('/',  isAdminOrFaculty, createProblem);
router.put('/:id',  isAdminOrFaculty, updateProblem);
router.delete('/:id',  isAdminOrFaculty, deleteProblem);
router.post('/:id/assign', isAdminOrFaculty, assignProblemToStudents);
router.get('/:id/students', isAdminOrFaculty, getProblemWithStudents);
router.get('/:id/unassignStudent', isAdminOrFaculty, getProblemWithUnassignedStudents);
router.get('/getStudents', isAdminOrFaculty, getStudents);
router.post('/:id/unassign-students', isAdminOrFaculty, unassignStudents);


// Public routes
router.get('/', getProblems);
router.get('/:id', getProblemById);

export default router;
