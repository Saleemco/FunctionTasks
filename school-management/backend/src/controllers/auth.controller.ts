import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacherProfile: true,
        parentProfile: true,
        studentProfile: true,
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Registration attempt:', req.body);
    
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      phone, 
      address, 
      occupation,
      qualification,
      specialization,
      classId,
      subjectIds 
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as any,
        isActive: true
      }
    });

    // Create role-specific profile
    if (role === 'TEACHER' || role === 'CLASS_TEACHER' || role === 'SUBJECT_TEACHER') {
      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          qualification: qualification || null,
          specialization: specialization || null,
          joiningDate: new Date()
        }
      });

      // Assign as class teacher if classId provided
      if (classId) {
        await prisma.class.update({
          where: { id: classId },
          data: { classTeacherId: teacher.id }
        });
      }

      // Assign subjects if subjectIds provided
      if (subjectIds && subjectIds.length > 0) {
        await prisma.subject.updateMany({
          where: { id: { in: subjectIds } },
          data: { teacherId: teacher.id }
        });
      }

      console.log('Teacher profile created with assignments');
    }
    
    if (role === 'PARENT') {
      await prisma.parent.create({
        data: {
          userId: user.id,
          phone,
          address,
          occupation
        }
      });
      console.log('Parent profile created');
    }
    
    if (role === 'STUDENT') {
      const admissionNo = 'ADM' + Date.now().toString().slice(-8);
      await prisma.student.create({
        data: {
          userId: user.id,
          admissionNo
        }
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    console.log('Registration successful for:', email);

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        teacherProfile: true,
        parentProfile: true,
        studentProfile: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};
