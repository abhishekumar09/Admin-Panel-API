import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const authMiddleware = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET!, async(err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    console.log({decoded});
    const userRole = await prisma.role.findUnique({
      where: { id: decoded.roleId },
      select: { name: true } 
    });
    console.log(userRole);
    if (!roles.includes(userRole.name)) return res.status(403).json({ message: 'Forbidden' });
    next();
  });
};

export default authMiddleware;
