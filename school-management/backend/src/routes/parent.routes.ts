import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getParents,
  getParentById,
  getParentByUserId,
  createParent,
  updateParent,
  deleteParent
} from '../controllers/parent.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', getParents);
router.get('/user/:userId', getParentByUserId);
router.get('/:id', getParentById);
router.post('/', createParent);
router.put('/:id', updateParent);
router.delete('/:id', deleteParent);

export default router;
