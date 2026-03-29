import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass
} from '../controllers/student.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/', getStudents);
router.get('/class/:classId', getStudentsByClass);
router.get('/:id', getStudentById);

// Create student - admin only
router.post('/', createStudent);  // Remove isAdmin, let controller handle it

// Update student - controller handles role-based permissions (admin full update, parents can link)
router.put('/:id', updateStudent);

// Delete student - admin only (keep isAdmin for safety)
router.delete('/:id', deleteStudent);

export default router;
