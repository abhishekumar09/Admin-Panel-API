import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createAuditLog } from './auditLogController'; // Adjust the import path

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body;
  const performedBy = req.user.userId; // Assume userId is available in req.user

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create the new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: {
          connect: { name: role },
        },
      },
    });

    // Log user creation
    await createAuditLog('User created', performedBy, `User ID: ${user.id}, Username: ${username}`);

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};


export const getUsers = async (req: Request, res: Response) => {
  const performedBy = req.user.userId; 

  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          name: {
            not: 'ADMIN',
          },
        },
      },
      include: {
        role: true,
      },
    });

    await createAuditLog('Users retrieved', performedBy, `Users count: ${users.length}`);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const performedBy = req.user.userId; // Assume userId is available in req.user

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log retrieval of a single user
    await createAuditLog('User retrieved by ID', performedBy, `User ID: ${id}`);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const performedBy = req.user.userId; // Assume userId is available in req.user

  const updatedData: any = {
    username,
    email,
  };

  if (password) {
    updatedData.password = await bcrypt.hash(password, 12);
  }

  try {
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user
    const user = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    // Log user update
    await createAuditLog('User updated', performedBy, `User ID: ${id}`);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const performedBy = req.user.userId; // Assume userId is available in req.user

  try {
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already deleted
    if (existingUser.deletedAt) {
      return res.status(400).json({ message: 'User is already deleted' });
    }

    // Mark the user as deleted
    const user = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log user deletion
    await createAuditLog('User deleted', performedBy, `User ID: ${id}`);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};
export const restoreUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const performedBy = req.user.userId; // Assume userId is available in req.user

  try {
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already restored
    if (!existingUser.deletedAt) {
      return res.status(400).json({ message: 'User is not deleted or already restored' });
    }

    // Restore the user
    const user = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    // Log user restoration
    await createAuditLog('User restored', performedBy, `User ID: ${id}`);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error restoring user', error });
  }
};
