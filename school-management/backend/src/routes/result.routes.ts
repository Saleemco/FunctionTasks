import { Router } from 'express';
import { authenticate, isTeacher, isPrincipal } from '../middleware/auth.middleware';
import {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  approveResult,
  getResultsByClass,
  getResultsByStudent
} from '../controllers/result.controller';

const router = Router();

router.use(authenticate);

router.get('/', getResults);
router.get('/class/:classId/term/:termId', getResultsByClass);
router.get('/student/:studentId', getResultsByStudent);
router.get('/:id', getResultById);

router.post('/', isTeacher, createResult);
router.put('/:id', isTeacher, updateResult);
router.delete('/:id', isTeacher, deleteResult);

router.patch('/:id/approve', isPrincipal, approveResult);

export default router;
