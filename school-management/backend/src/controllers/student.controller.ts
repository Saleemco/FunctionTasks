import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all students
export const getStudents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        class: true,
        parent: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
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

// Get student by ID
export const getStudentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: true,
        parent: {
          include: {
            user: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// Create new student
export const createStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, admissionNo, classId, parentId, dob, gender } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!existingClass) {
      return res.status(400).json({ message: 'Class not found' });
    }

    // Use a default password
    const defaultPassword = '$' + Math.random().toString(36).substring(2, 15);

    // Prepare the data object
    const data: any = {
      admissionNo,
      class: {
        connect: { id: classId }
      },
      dob: dob ? new Date(dob) : null,
      gender,
      enrollmentDate: new Date(),
      user: {
        create: {
          email,
          password: defaultPassword,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: 'STUDENT',
          isActive: true
        }
      }
    };

    // Handle parent connection if provided
    if (parentId) {
      data.parent = {
        connect: { id: parentId }
      };
    }

    // Create student
    const student = await prisma.student.create({
      data,
      include: {
        user: true,
        class: true,
        parent: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: student,
      message: 'Student created successfully'
    });
  } catch (error) {
    console.error('Error creating student:', error);
    next(error);
  }
};

// Update student
export const updateStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, admissionNo, classId, parentId, dob, gender } = req.body;

    const data: any = {
      admissionNo,
      class: classId ? { connect: { id: classId } } : undefined,
      dob: dob ? new Date(dob) : null,
      gender,
      user: {
        update: {
          firstName: firstName?.trim(),
          lastName: lastName?.trim()
        }
      }
    };

    // Handle parent connection/disconnection
    if (parentId) {
      data.parent = { connect: { id: parentId } };
    } else {
      data.parent = { disconnect: true };
    }

    const student = await prisma.student.update({
      where: { id },
      data,
      include: {
        user: true,
        class: true,
        parent: {
          include: {
            user: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: student,
      message: 'Student updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete student
export const deleteStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get student to find userId
    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete student first
    await prisma.student.delete({
      where: { id }
    });

    // Then delete user
    await prisma.user.delete({
      where: { id: student.userId }
    });

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    next(error);
  }
};

// Get students by class
export const getStudentsByClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { classId } = req.params;

    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
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
