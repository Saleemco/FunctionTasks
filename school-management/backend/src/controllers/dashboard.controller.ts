import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";

// Parent dashboard
export const getParentDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    console.log('🔍 Parent dashboard for user ID:', userId);

    const parent = await prisma.parent.findFirst({
      where: { userId: userId }
    });

    if (!parent) {
      console.log('❌ No parent profile found');
      return res.json({
        success: true,
        data: { children: [] }
      });
    }

    console.log('✅ Parent profile ID:', parent.id);

    const children = await prisma.student.findMany({
      where: {
        parentId: parent.id
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        class: true,
        fees: {
          include: {
            term: {
              include: {
                session: true
              }
            }
          }
        },
        results: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            subject: true,
            term: {
              include: {
                session: true
              }
            }
          }
        }
      }
    });

    console.log('📊 Found ' + children.length + ' children for this parent');

    res.json({
      success: true,
      data: { children }
    });

  } catch (error) {
    console.error('❌ Parent dashboard error:', error);
    next(error);
  }
};

// Admin dashboard
export const getAdminDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalStudents, totalTeachers, totalClasses, feeStats] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.studentFee.aggregate({
        _sum: { amountPaid: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        activeClasses: totalClasses,
        revenue: feeStats._sum.amountPaid || 0,
        totalParents: await prisma.parent.count(),
        totalResults: await prisma.result.count()
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    next(error);
  }
};

// Principal dashboard
export const getPrincipalDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('📊 Principal dashboard API called');
    
    const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count()
    ]);

    const results = await prisma.result.findMany({
      select: { total: true }
    });
    
    const passedResults = results.filter(r => r.total >= 40).length;
    const passRate = results.length > 0 ? Math.round((passedResults / results.length) * 100) : 0;

    const attendance = 94;

    const feeStats = await prisma.studentFee.aggregate({
      _sum: { amountPaid: true }
    });
    const feeCollection = feeStats._sum.amountPaid || 0;

    console.log('✅ Principal data fetched:', {
      totalStudents,
      totalTeachers,
      totalClasses,
      passRate,
      feeCollection
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        activeClasses: totalClasses,
        passRate,
        attendance,
        feeCollection,
        studentIncrease: '+12%',
        teacherIncrease: '+4%',
        classIncrease: '+8%'
      }
    });

  } catch (error) {
    console.error('❌ Principal dashboard error:', error);
    next(error);
  }
};

// Teacher dashboard
export const getTeacherDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    console.log('👨‍🏫 Teacher dashboard for user ID:', userId);

    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: {
        subjects: {
          include: {
            class: true,
            _count: {
              select: { results: true }
            }
          }
        },
        managedClass: {
          include: {
            _count: {
              select: {
                students: true,
                subjects: true
              }
            },
            students: {
              take: 5,
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

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const activeTerm = await prisma.termInfo.findFirst({
      where: { isActive: true }
    });

    const pendingResults = await prisma.result.count({
      where: {
        subject: {
          teacherId: teacher.id
        },
        isApproved: false,
        ...(activeTerm && { termId: activeTerm.id })
      }
    });

    const recentResults = await prisma.result.findMany({
      where: {
        subject: {
          teacherId: teacher.id
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
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
        },
        subject: true
      }
    });

    let classPerformance = null;
    if (teacher.managedClass) {
      const classResults = await prisma.result.findMany({
        where: {
          student: {
            classId: teacher.managedClass.id
          },
          ...(activeTerm && { termId: activeTerm.id })
        },
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
          },
          subject: true
        }
      });

      const totalScores = classResults.reduce((sum, r) => sum + r.total, 0);
      const averageScore = classResults.length > 0 ? Math.round(totalScores / classResults.length) : 0;

      classPerformance = {
        averageScore,
        totalResults: classResults.length,
        students: teacher.managedClass.students
      };
    }

    res.json({
      success: true,
      data: {
        teacher: {
          id: teacher.id,
          qualification: teacher.qualification,
          specialization: teacher.specialization
        },
        teachingLoad: teacher.subjects.length,
        subjects: teacher.subjects,
        managingClass: teacher.managedClass ? {
          id: teacher.managedClass.id,
          name: teacher.managedClass.name,
          section: teacher.managedClass.section,
          studentCount: teacher.managedClass._count.students,
          subjectCount: teacher.managedClass._count.subjects,
          recentStudents: teacher.managedClass.students
        } : null,
        pendingResults,
        recentResults,
        classPerformance,
        activeTerm
      }
    });

  } catch (error) {
    console.error('❌ Teacher dashboard error:', error);
    next(error);
  }
};

// Bursar dashboard
export const getBursarDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  res.json({ success: true, data: {} });
};
