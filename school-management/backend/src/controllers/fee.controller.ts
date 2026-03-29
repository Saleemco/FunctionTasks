import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all fees
export const getAllFees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fees = await prisma.studentFee.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            class: true
          }
        },
        term: {
          include: {
            session: true
          }
        },
        payments: {
          include: {
            recordedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    next(error);
  }
};

// Get fee by ID
export const getFeeById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const fee = await prisma.studentFee.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            class: true
          }
        },
        term: {
          include: {
            session: true
          }
        },
        payments: {
          include: {
            recordedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    res.json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// Get fees by student
export const getFeesByStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;

    const fees = await prisma.studentFee.findMany({
      where: { studentId },
      include: {
        term: {
          include: {
            session: true
          }
        },
        payments: {
          include: {
            recordedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        term: {
          startDate: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    next(error);
  }
};

// Get fees for parent's children
export const getParentFees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    console.log('👪 Getting fees for parent user:', userId);
    
    const parent = await prisma.parent.findFirst({
      where: { userId: userId }
    });

    if (!parent) {
      console.log('❌ No parent profile found');
      return res.json({
        success: true,
        data: { fees: [] }
      });
    }

    console.log('✅ Parent found with ID:', parent.id);

    const children = await prisma.student.findMany({
      where: { parentId: parent.id },
      select: { id: true }
    });

    const childIds = children.map(c => c.id);
    console.log('📚 Found', childIds.length, 'children');

    if (childIds.length === 0) {
      return res.json({
        success: true,
        data: { fees: [] }
      });
    }

    const fees = await prisma.studentFee.findMany({
      where: {
        studentId: { in: childIds }
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            class: true
          }
        },
        term: {
          include: {
            session: true
          }
        },
        payments: true
      },
      orderBy: [
        { student: { admissionNo: 'asc' } },
        { term: { startDate: 'desc' } }
      ]
    });

    console.log('💰 Found', fees.length, 'fee records for all children');

    const feesByChild = childIds.map(childId => {
      const childFees = fees.filter(f => f.studentId === childId);
      const child = fees.find(f => f.studentId === childId)?.student;
      
      return {
        childId,
        childName: child ? child.user?.firstName + ' ' + child.user?.lastName : 'Unknown',
        admissionNo: child?.admissionNo,
        class: child?.class,
        fees: childFees,
        totalOutstanding: childFees.reduce((sum, f) => sum + (f.balance || 0), 0)
      };
    });

    res.json({
      success: true,
      data: {
        fees: feesByChild,
        totalOutstanding: fees.reduce((sum, f) => sum + (f.balance || 0), 0)
      }
    });

  } catch (error) {
    console.error('❌ Error getting parent fees:', error);
    next(error);
  }
};

// Create new fee record
export const createFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studentId, termId, totalAmount } = req.body;

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const term = await prisma.termInfo.findUnique({
      where: { id: termId }
    });

    if (!term) {
      return res.status(404).json({ message: 'Term not found' });
    }

    const existingFee = await prisma.studentFee.findFirst({
      where: {
        studentId,
        termId
      }
    });

    if (existingFee) {
      return res.status(400).json({ message: 'Fee record already exists for this student and term' });
    }

    const fee = await prisma.studentFee.create({
      data: {
        studentId,
        termId,
        totalAmount,
        amountPaid: 0,
        balance: totalAmount,
        status: 'UNPAID'
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
        term: {
          include: {
            session: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: fee,
      message: 'Fee record created successfully'
    });
  } catch (error) {
    console.error('Error creating fee:', error);
    next(error);
  }
};

// Update fee record
export const updateFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { totalAmount } = req.body;

    const fee = await prisma.studentFee.findUnique({
      where: { id }
    });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const newBalance = totalAmount - fee.amountPaid;
    const status = newBalance <= 0 ? 'PAID' : newBalance < totalAmount ? 'PARTIALLY_PAID' : 'UNPAID';

    const updatedFee = await prisma.studentFee.update({
      where: { id },
      data: {
        totalAmount,
        balance: newBalance,
        status
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
        term: true
      }
    });

    res.json({
      success: true,
      data: updatedFee,
      message: 'Fee record updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete fee record
export const deleteFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const fee = await prisma.studentFee.findUnique({
      where: { id },
      include: {
        payments: true
      }
    });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (fee.payments.length > 0) {
      return res.status(400).json({ message: 'Cannot delete fee record with existing payments' });
    }

    await prisma.studentFee.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Fee record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Record payment
export const recordPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, method, reference } = req.body;

    const fee = await prisma.studentFee.findUnique({
      where: { id }
    });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    if (amount > fee.balance) {
      return res.status(400).json({ message: 'Amount cannot exceed balance' });
    }

    const payment = await prisma.payment.create({
      data: {
        feeId: id,
        amount,
        method,
        reference,
        recordedById: req.user!.id
      }
    });

    const newAmountPaid = fee.amountPaid + amount;
    const newBalance = fee.totalAmount - newAmountPaid;
    const status = newBalance <= 0 ? 'PAID' : newBalance < fee.totalAmount ? 'PARTIALLY_PAID' : 'UNPAID';
    const receiptNo = status === 'PAID' ? 'RCP' + Date.now().toString().slice(-8) : fee.receiptNo;

    const updatedFee = await prisma.studentFee.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status,
        receiptNo
      }
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    next(error);
  }
};

// Get fee summary
export const getFeeSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await prisma.studentFee.aggregate({
      _sum: {
        totalAmount: true,
        amountPaid: true,
        balance: true
      },
      _count: {
        id: true
      }
    });

    const totalExpected = summary._sum.totalAmount || 0;
    const totalCollected = summary._sum.amountPaid || 0;
    const totalOutstanding = summary._sum.balance || 0;
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalExpected,
        totalCollected,
        totalOutstanding,
        collectionRate,
        totalRecords: summary._count.id
      }
    });
  } catch (error) {
    next(error);
  }
};
