import { Router } from "express";
import { 
  getPrincipalDashboard, 
  getTeacherDashboard, 
  getParentDashboard, 
  getBursarDashboard,
  getAdminDashboard 
} from "../controllers/dashboard.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/admin", authenticate, authorize("ADMIN"), getAdminDashboard);
router.get("/principal", authenticate, authorize("PRINCIPAL", "ADMIN"), getPrincipalDashboard);
router.get("/teacher", authenticate, authorize("SUBJECT_TEACHER", "CLASS_TEACHER"), getTeacherDashboard);
router.get("/parent", authenticate, authorize("PARENT"), getParentDashboard);
router.get("/bursar", authenticate, authorize("BURSAR", "PRINCIPAL", "ADMIN"), getBursarDashboard);

export default router;
