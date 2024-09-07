import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createAuditLog } from './auditLogController'; // Adjust the import path

const prisma = new PrismaClient();

// Assign Role to User
export const assignRoleToUser = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { roleName } = req.body; // Expected to receive role name from the request body
    const performedBy = req.user.userId; // Assume userId is available in req.user
  
    try {
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Find the role by its name
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });
  
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
  
      // Check if the user already has the role assigned
      const userWithRole = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });
  
      if (userWithRole.role?.name === roleName) {
        return res.status(400).json({ message: 'User already has this role assigned' });
      }
  
      // Assign the role to the user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: {
            connect: {
              id: role.id, // Connects the user to the role
            },
          },
        },
      });
  
      // Log role assignment
      await createAuditLog('Role assigned to user', performedBy, `User ID: ${userId}, Role: ${roleName}`);
  
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error });
    }
  };
  

// Revoke Role from User and assign default role
export const revokeRoleFromUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const performedBy = req.user.userId; // Assume userId is available in req.user

  try {
    // Find the default role
    const defaultRole = await prisma.role.findUnique({
      where: { name: 'EMPLOYEE' }, 
    });

    if (!defaultRole) {
      return res.status(404).json({ message: 'Default role not found' });
    }

    // Revoke current role and assign the default role to the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: {
          connect: { id: defaultRole.id }, // Connects the user to the default role
        },
      },
    });

    // Log role revocation and reassignment
    await createAuditLog('Role revoked from user and default role assigned', performedBy, `User ID: ${userId}, New Role: ${defaultRole.name}`);

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
