import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';

export const getResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const results = await prisma.result.findMany({
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        subject: true,
        term: {
          include: { session: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const getResultById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        subject: true,
        term: {
          include: { session: true }
        }
      }
    });
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createResult = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentId, subjectId, termId, ca1, ca2, exam, teacherRemark } = req.body;
    
    // Calculate total and grade
    const total = ca1 + ca2 + exam;
    let grade = 'F';
    
    if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B';
    else if (total >= 50) grade = 'C';
    else if (total >= 40) grade = 'D';
    else grade = 'F';

    const result = await prisma.result.create({
      data: {
        studentId,
        subjectId,
        termId,
        ca1,
        ca2,
        exam,
        total,
        grade,
        teacherRemark,
        isApproved: false
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        subject: true,
        term: true
      }
    });
    
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateResult = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { ca1, ca2, exam, teacherRemark } = req.body;
    
    // Calculate total and grade
    const total = ca1 + ca2 + exam;
    let grade = 'F';
    
    if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B';
    else if (total >= 50) grade = 'C';
    else if (total >= 40) grade = 'D';
    else grade = 'F';

    const result = await prisma.result.update({
      where: { id },
      data: {
        ca1,
        ca2,
        exam,
        total,
        grade,
        teacherRemark,
        isApproved: false // Reset approval on update
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        subject: true,
        term: true
      }
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteResult = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.result.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Result deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const approveResult = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.result.update({
      where: { id },
      data: {
        isApproved: true,
        approvedBy: req.user?.id,
        approvedAt: new Date()
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        subject: true,
        term: true
      }
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getResultsByClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, termId } = req.params;
    
    const results = await prisma.result.findMany({
      where: {
        student: { classId },
        termId
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        subject: true
      },
      orderBy: [
        { student: { admissionNo: 'asc' } },
        { subject: { name: 'asc' } }
      ]
    });
    
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const getResultsByStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    
    const results = await prisma.result.findMany({
      where: { studentId },
      include: {
        subject: true,
        term: {
          include: { session: true }
        }
      },
      orderBy: [
        { term: { startDate: 'desc' } },
        { subject: { name: 'asc' } }
      ]
    });
    
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
