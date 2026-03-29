import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignSubjectTeacher,
  assignClassTeacher
} from "../controllers/user.controller";
import { authenticate, isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate, isAdmin);

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/assign-subject-teacher", assignSubjectTeacher);
router.post("/assign-class-teacher", assignClassTeacher);

export default router;
