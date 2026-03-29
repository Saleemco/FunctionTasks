import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllFees,
  getFeeById,
  getFeesByStudent,
  createFee,
  updateFee,
  deleteFee,
  recordPayment,
  getFeeSummary,
  getParentFees  // Add this import
} from '../controllers/fee.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/', getAllFees);
router.get('/summary', getFeeSummary);
router.get('/student/:studentId', getFeesByStudent);
router.get('/parent', getParentFees);  // NEW: Get fees for parent's children
router.get('/:id', getFeeById);

// Routes requiring bursar or admin role
router.post('/', createFee);
router.post('/:id/payments', recordPayment);
router.put('/:id', updateFee);
router.delete('/:id', deleteFee);

export default router;
