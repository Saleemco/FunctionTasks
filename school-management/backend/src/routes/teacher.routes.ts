import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getTeachers,
  getTeacherById
} from '../controllers/teacher.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all teachers
router.get('/', getTeachers);
router.get('/:id', getTeacherById);

export default router;
