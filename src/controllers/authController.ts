import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createAuditLog } from './auditLogController'; // Adjust the import path

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await createAuditLog('Failed login attempt', 'N/A', `Email: ${email}`);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    await createAuditLog('Failed login attempt', user.id, `Email: ${email}`);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user.id, roleId: user.roleId },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Log successful login
  await createAuditLog('User logged in', user.id, `Email: ${email}`);

  res.json({ token });
};

export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const roles = ['ADMIN', 'EMPLOYEE', 'MANAGER'];
    
  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', permissions: ['*'] }, // Full access
  });
  
  await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: { name: 'EMPLOYEE', permissions: ['VIEW_OWN_DATA'] }, // View only own data
  });
  
  await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: { name: 'MANAGER', permissions: ['MANAGE_PROJECTS'] }, // Manage projects
  });
  
  
console.log(prisma.role.findMany);
  // Check if there is already an admin
  const adminCount = await prisma.user.count({
    where: {
      role: { name: 'ADMIN' },
    },
  });

  if (adminCount > 0) {
    return res.status(403).json({ message: 'An admin already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: {
        connect: {
          name: 'ADMIN',
        },
      },
    },
  });

  // Log admin signup
  await createAuditLog('Admin signed up', user.id, `Username: ${username}`);

  res.status(201).json(user);
};


export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body;
  const whoCreates  = req.user ;
  // Check if a user with the given email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: {
          connect: {
            name: role,
          },
        },
      },
    });

    // Log user registration
    await createAuditLog('User registered', whoCreates.userId, `Username: ${username}`);

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};


