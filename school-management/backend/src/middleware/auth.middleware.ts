import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        teacherProfile: true,
        parentProfile: true,
        studentProfile: true,
      }
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Authorize middleware that checks if user role is in allowed roles
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please authenticate' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to access this resource.' 
      });
    }
    
    next();
  };
};

// Convenience middleware for common roles
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'PRINCIPAL') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

export const isPrincipal = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'PRINCIPAL' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Principal only.' });
  }
  next();
};

export const isTeacher = (req: AuthRequest, res: Response, next: NextFunction) => {
  const teacherRoles = ['CLASS_TEACHER', 'SUBJECT_TEACHER', 'PRINCIPAL', 'ADMIN'];
  if (!teacherRoles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied. Teachers only.' });
  }
  next();
};

export const isBursar = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'BURSAR' && req.user?.role !== 'ADMIN' && req.user?.role !== 'PRINCIPAL') {
    return res.status(403).json({ message: 'Access denied. Bursar only.' });
  }
  next();
};

export const isParent = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'PARENT' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Parents only.' });
  }
  next();
};

export const isStudent = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'STUDENT' && req.user?.role !== 'PARENT' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
};
