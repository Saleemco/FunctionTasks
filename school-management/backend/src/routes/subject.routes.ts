import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
  getSubjects,
  getSubjectById,
  getSubjectsByClass,
  createSubject,
  updateSubject,
  deleteSubject,
  assignTeacher
} from '../controllers/subject.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/', getSubjects);
router.get('/class/:classId', getSubjectsByClass);
router.get('/:id', getSubjectById);

// Routes requiring admin role
router.post('/', isAdmin, createSubject);
router.put('/:id', isAdmin, updateSubject);
router.delete('/:id', isAdmin, deleteSubject);
router.post('/:id/assign-teacher', isAdmin, assignTeacher);

export default router;
