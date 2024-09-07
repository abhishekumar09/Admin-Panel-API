import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAuditLogs = async (req: Request, res: Response) => {
  const logs = await prisma.auditLog.findMany({
    include: {
      performedBy: true,
    },
  });

  res.json(logs);
};


export const createAuditLog = async (action: string, performedById: string, targetResource: string) => {
  try {
    // Check if the user exists
    if (performedById !== null) {
      const userExists = await prisma.user.findUnique({
        where: { id: performedById },
      });

      if (!userExists) {
        console.error('User not found:', performedById);
        return; // Exit early if user does not exist
      }
    }

    await prisma.auditLog.create({
      data: {
        action,
        performedById,
        targetResource,
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw new Error('Error creating audit log');
  }
};
