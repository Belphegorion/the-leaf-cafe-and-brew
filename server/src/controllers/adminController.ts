import { Response } from 'express';
import { z } from 'zod';
import { store } from '../services/store';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getReports = (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  const reports = store.getReports(startDate as string | undefined, endDate as string | undefined);
  res.json({
    success: true,
    data: reports,
  });
};

export const exportReportsCsv = (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  const csvData = store.exportReportsCsv(startDate as string | undefined, endDate as string | undefined);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="the-leaf-sales-report-${Date.now()}.csv"`);
  res.send(csvData);
};

export const getAuditLogs = (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const page = Math.max(1, Number(req.query.page) || 1);

  const { logs, total } = store.getAuditLogs(limit, page);

  res.json({
    success: true,
    data: logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getSettings = (_req: AuthenticatedRequest, res: Response) => {
  const settings = store.getSettings();
  res.json({
    success: true,
    data: settings,
  });
};

const settingsSchema = z.object({
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  hoursDisplay: z.string().optional(),
  tableDepositDefault: z.number().min(0).optional(),
  deliveryEnabled: z.boolean().optional(),
  maxCapacityPerSlot: z.number().min(1).max(50).optional(),
});

export const updateSettings = (req: AuthenticatedRequest, res: Response) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid settings data', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const before = store.getSettings();
  const updated = store.updateSettings(parsed.data);

  if (req.user) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: 'UPDATE_SETTINGS',
      entity: 'CafeSettings',
      entityId: 'global',
      before,
      after: updated,
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  res.json({
    success: true,
    message: 'Operational settings updated successfully',
    data: updated,
  });
};
