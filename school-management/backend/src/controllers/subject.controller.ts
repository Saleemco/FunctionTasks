import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all subjects with their classes
export const getSubjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        classes: {
          include: {
            class: true
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: { results: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const transformedSubjects = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      teacherId: subject.teacherId,
      teacher: subject.teacher,
      classes: subject.classes.map(sc => sc.class),
      _count: subject._count
    }));

    res.json({
      success: true,
      data: transformedSubjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    next(error);
  }
};

// Get subject by ID
export const getSubjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            class: true
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        results: {
          include: {
            student: {
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
        }
      }
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const transformedSubject = {
      id: subject.id,
      name: subject.name,
      teacherId: subject.teacherId,
      teacher: subject.teacher,
      classes: subject.classes.map(sc => sc.class),
      results: subject.results
    };

    res.json({
      success: true,
      data: transformedSubject
    });
  } catch (error) {
    next(error);
  }
};

// Get subjects by class
export const getSubjectsByClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { classId } = req.params;
    
    const subjects = await prisma.subject.findMany({
      where: {
        classes: {
          some: { classId }
        }
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    next(error);
  }
};

// Create new subject with multiple classes
export const createSubject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, classIds } = req.body;

    if (!name || !classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ 
        message: 'Subject name and at least one class are required' 
      });
    }

    const subject = await prisma.$transaction(async (tx) => {
      const newSubject = await tx.subject.create({
        data: { name }
      });

      await tx.subjectClass.createMany({
        data: classIds.map((classId: string) => ({
          subjectId: newSubject.id,
          classId
        }))
      });

      return tx.subject.findUnique({
        where: { id: newSubject.id },
        include: {
          classes: {
            include: {
              class: true
            }
          }
        }
      });
    });

    const transformedSubject = {
      id: subject?.id,
      name: subject?.name,
      classes: subject?.classes.map(sc => sc.class) || []
    };

    res.status(201).json({
      success: true,
      data: transformedSubject,
      message: 'Subject created successfully'
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    next(error);
  }
};

// Update subject
export const updateSubject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, classIds } = req.body;

    if (!name || !classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ 
        message: 'Subject name and at least one class are required' 
      });
    }

    const subject = await prisma.$transaction(async (tx) => {
      await tx.subject.update({
        where: { id },
        data: { name }
      });

      await tx.subjectClass.deleteMany({
        where: { subjectId: id }
      });

      if (classIds.length > 0) {
        await tx.subjectClass.createMany({
          data: classIds.map((classId: string) => ({
            subjectId: id,
            classId
          }))
        });
      }

      return tx.subject.findUnique({
        where: { id },
        include: {
          classes: {
            include: {
              class: true
            }
          }
        }
      });
    });

    const transformedSubject = {
      id: subject?.id,
      name: subject?.name,
      classes: subject?.classes.map(sc => sc.class) || []
    };

    res.json({
      success: true,
      data: transformedSubject,
      message: 'Subject updated successfully'
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    next(error);
  }
};

// Delete subject
export const deleteSubject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: { results: true }
        }
      }
    });

    if (subject?._count.results && subject._count.results > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete subject with existing results' 
      });
    }

    await prisma.$transaction([
      prisma.subjectClass.deleteMany({ where: { subjectId: id } }),
      prisma.subject.delete({ where: { id } })
    ]);

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    next(error);
  }
};

// Assign teacher to subject
export const assignTeacher = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    const subject = await prisma.subject.update({
      where: { id },
      data: { teacherId },
      include: {
        teacher: {
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
      data: subject,
      message: 'Teacher assigned successfully'
    });
  } catch (error) {
    next(error);
  }
};