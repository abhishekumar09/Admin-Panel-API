import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware(['ADMIN']), getAuditLogs);

export default router;
