import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all classes
export const getClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        classTeacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      },
      orderBy: [
        { name: 'asc' },
        { section: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    next(error);
  }
};

// Get class by ID
export const getClassById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        classTeacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        students: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        subjects: true,
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    next(error);
  }
};

// Create new class
export const createClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, section, classTeacherId } = req.body;

    // Check if class already exists
    const existingClass = await prisma.class.findFirst({
      where: {
        name,
        section
      }
    });

    if (existingClass) {
      return res.status(400).json({ 
        message: 'Class with this name and section already exists' 
      });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        classTeacherId
      },
      include: {
        classTeacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newClass,
      message: 'Class created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update class
export const updateClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, section, classTeacherId } = req.body;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        section,
        classTeacherId
      },
      include: {
        classTeacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedClass,
      message: 'Class updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete class
export const deleteClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if class has students
    const classWithStudents = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (classWithStudents?._count.students && classWithStudents._count.students > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete class with enrolled students. Transfer students first.' 
      });
    }

    await prisma.class.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get students in a class
export const getClassStudents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const students = await prisma.student.findMany({
      where: { classId: id },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: {
        admissionNo: 'asc'
      }
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// Get subjects in a class
export const getClassSubjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const subjects = await prisma.subject.findMany({
      where: { classId: id },
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    next(error);
  }
};
