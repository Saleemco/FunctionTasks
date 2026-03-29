import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all teachers
export const getTeachers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            id: true
          }
        },
        subjects: {
          include: {
            class: true
          }
        },
        managedClass: true
      }
    });

    console.log('📚 Found teachers:', teachers.length);

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    next(error);
  }
};

// Get teacher by ID
export const getTeacherById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        subjects: {
          include: {
            class: true
          }
        },
        managedClass: true
      }
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};
