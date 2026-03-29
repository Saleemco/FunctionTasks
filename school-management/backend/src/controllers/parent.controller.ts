import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all parents
export const getParents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parents = await prisma.parent.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        children: {
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
      data: parents
    });
  } catch (error) {
    next(error);
  }
};

// Get parent by ID
export const getParentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        children: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            class: true
          }
        }
      }
    });

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    next(error);
  }
};

// Get parent by user ID
export const getParentByUserId = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        children: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            class: true
          }
        }
      }
    });

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    next(error);
  }
};

// Create parent
export const createParent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, occupation, address, phone } = req.body;

    // Check if parent already exists for this user
    const existingParent = await prisma.parent.findUnique({
      where: { userId }
    });

    if (existingParent) {
      return res.status(400).json({ message: 'Parent already exists for this user' });
    }

    const parent = await prisma.parent.create({
      data: {
        userId,
        occupation,
        address,
        phone
      },
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

    res.status(201).json({
      success: true,
      data: parent
    });
  } catch (error) {
    next(error);
  }
};

// Update parent
export const updateParent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { occupation, address, phone } = req.body;

    const parent = await prisma.parent.update({
      where: { id },
      data: {
        occupation,
        address,
        phone
      },
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
      data: parent
    });
  } catch (error) {
    next(error);
  }
};

// Delete parent
export const deleteParent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if parent has children
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        children: true
      }
    });

    if (parent?.children && parent.children.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete parent with linked children. Remove children links first.' 
      });
    }

    await prisma.parent.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Parent deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
