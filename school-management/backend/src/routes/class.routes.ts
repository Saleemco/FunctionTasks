import { Router } from 'express';
import { authenticate, isAdmin, isPrincipal } from '../middleware/auth.middleware';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  getClassSubjects
} from '../controllers/class.controller';

const router = Router();

// All class routes require authentication
router.use(authenticate);

// Public routes (accessible by authenticated users)
router.get('/', getClasses);
router.get('/:id', getClassById);
router.get('/:id/students', getClassStudents);
router.get('/:id/subjects', getClassSubjects);

// Protected routes (admin/principal only)
router.post('/', isAdmin, createClass);
router.put('/:id', isAdmin, updateClass);
router.delete('/:id', isAdmin, deleteClass);

export default router;
