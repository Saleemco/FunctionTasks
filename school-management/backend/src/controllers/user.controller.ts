import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/database";
import { AppError } from "../middleware/error.middleware";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["PRINCIPAL", "ADMIN", "BURSAR", "CLASS_TEACHER", "SUBJECT_TEACHER", "PARENT", "STUDENT"]),
  classId: z.string().optional(),
  parentId: z.string().optional(),
  admissionNo: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);
    
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role as any
        }
      });
      
      switch (data.role) {
        case "STUDENT":
          if (!data.classId || !data.parentId) {
            throw new AppError("Class ID and Parent ID required for students", 400);
          }
          await tx.student.create({
            data: {
              userId: user.id,
              classId: data.classId,
              parentId: data.parentId,
              admissionNo: data.admissionNo || `ADM${Date.now()}`
            }
          });
          break;
          
        case "PARENT":
          await tx.parent.create({
            data: {
              userId: user.id,
              occupation: data.occupation,
              address: data.address,
              phone: data.phone
            }
          });
          break;
          
        case "SUBJECT_TEACHER":
        case "CLASS_TEACHER":
          await tx.teacher.create({
            data: {
              userId: user.id,
              qualification: data.qualification,
              specialization: data.specialization
            }
          });
          break;
      }
      
      return user;
    });
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: result.id, email: result.email, role: result.role }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, search, page = "1", limit = "10" } = req.query;
    
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: "insensitive" } },
        { lastName: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } }
      ];
    }
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          teacherProfile: true,
          parentProfile: true,
          studentProfile: {
            include: {
              class: { select: { name: true } },
              parent: {
                include: {
                  user: { select: { firstName: true, lastName: true } }
                }
              }
            }
          }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    next(error);
  }
};
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        teacherProfile: {
          include: {
            subjects: { include: { class: true } },
            managedClass: true
          }
        },
        parentProfile: {
          include: {
            children: {
              include: {
                user: { select: { firstName: true, lastName: true } },
                class: true
              }
            }
          }
        },
        studentProfile: {
          include: {
            class: true,
            parent: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true } }
              }
            }
          }
        }
      }
    });
    
    if (!user) throw new AppError("User not found", 404);
    
    const { password, ...userWithoutPassword } = user as any;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, isActive } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, isActive },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true }
    });
    
    res.json({ success: true, message: "User updated", data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const assignSubjectTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacherId, subjectId } = req.body;
    
    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: { teacherId }
    });
    
    res.json({ success: true, message: "Teacher assigned to subject", data: subject });
  } catch (error) {
    next(error);
  }
};

export const assignClassTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacherId, classId } = req.body;
    
    await prisma.class.updateMany({
      where: { classTeacherId: teacherId },
      data: { classTeacherId: null }
    });
    
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { classTeacherId: teacherId }
    });
    
    res.json({ success: true, message: "Class teacher assigned", data: updatedClass });
  } catch (error) {
    next(error);
  }
};
