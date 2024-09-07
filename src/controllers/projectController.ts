import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createAuditLog } from './auditLogController'; // Adjust the import path

const prisma = new PrismaClient();

export const createProject = async (req: Request, res: Response) => {
  const { name, description, assignedTo } = req.body;
  const createdBy = req.user.userId;
  console.log({name , description , assignedTo});
  const existingProject = await prisma.project.findFirst({
    where: { name },
  });

  if (existingProject) {
    return res.status(409).json({ message: 'Project with this name already exists' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: createdBy,
        assignedTo: {
          connect: assignedTo.map((userId: string) => ({ id: userId })),
        },
      },
    });

    // Log project creation
    await createAuditLog('Project created', createdBy, `Project ID: ${project.id}, Name: ${name}`);

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  const { userId, roleId } = req.user;

  try {
    let projects;

    if (roleId === 'ADMIN') {
      projects = await prisma.project.findMany();
      // Log fetching all projects
      await createAuditLog('Fetched all projects', userId, 'N/A');
    } else {
      projects = await prisma.project.findMany({
        where: {
          assignedTo: {
            some: {
              id: userId,
            },
          },
        },
      });
      // Log fetching projects assigned to the user
      await createAuditLog('Fetched assigned projects', userId, 'N/A');
    }

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};


export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const performedBy = req.user.userId; // Assume userId is available in req.user

  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      // Log failed attempt to fetch project by ID
      await createAuditLog('Failed to fetch project by ID', performedBy, `Project ID: ${id}`);
      return res.status(404).json({ message: 'Project not found' });
    }

    // Log successful fetch of project by ID
    await createAuditLog('Fetched project by ID', performedBy, `Project ID: ${id}`);

    res.json(project);
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({ message: 'Error fetching project by ID', error });
  }
};


export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, assignedTo, unassignedTo } = req.body;
  const updatedBy = req.user.userId;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        assignedTo: {
          connect: assignedTo?.map((userId: string) => ({ id: userId })) || [],
          disconnect: unassignedTo?.map((userId: string) => ({ id: userId })) || [],
        },
      },
    });

    // Log project update
    await createAuditLog('Project updated', updatedBy, `Project ID: ${id}, Name: ${name}`);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedBy = req.user.userId;

  // Check if the project exists
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (existingProject.deletedAt) {
    return res.status(400).json({ message: 'Project already deleted' });
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log project deletion
    await createAuditLog('Project deleted', deletedBy, `Project ID: ${id}`);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
};

export const restoreProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const restoredBy = req.user.userId;

  // Check if the project exists
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (!existingProject.deletedAt) {
    return res.status(400).json({ message: 'Project is not deleted or already restored' });
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    // Log project restoration
    await createAuditLog('Project restored', restoredBy, `Project ID: ${id}`);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error restoring project', error });
  }
};

