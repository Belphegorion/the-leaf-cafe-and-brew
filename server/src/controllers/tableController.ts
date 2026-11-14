import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../services/store';
import { getIO } from '../socket';
import { AppError } from '../middleware/errorHandler';

export const getTables = (_req: Request, res: Response) => {
  const tables = store.getTables();
  res.json({ success: true, count: tables.length, data: tables, tables: tables });
};

export const getTableByNumber = (req: Request, res: Response) => {
  const tableNumber = Number(req.params.tableNumber);
  if (isNaN(tableNumber)) {
    throw new AppError('Invalid table number', 400, 'VALIDATION_ERROR');
  }
  const table = store.getTableByNumber(tableNumber);
  if (!table) {
    throw new AppError(`Table #${tableNumber} not found.`, 404, 'NOT_FOUND');
  }
  res.json({ success: true, data: table });
};

const alertSchema = z.object({
  action: z.enum(['waiter', 'water', 'bill', 'clear']).optional(),
  type: z.enum(['waiter', 'water', 'bill', 'clear']).optional(),
  active: z.boolean().default(true),
});

export const triggerTableAlert = (req: Request, res: Response) => {
  const tableNumber = Number(req.params.tableNumber);
  if (isNaN(tableNumber)) {
    throw new AppError('Invalid table number', 400, 'VALIDATION_ERROR');
  }

  const parsed = alertSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Action must be waiter, water, bill, or clear.', 400, 'VALIDATION_ERROR');
  }

  const action = (parsed.data.action || parsed.data.type || 'waiter') as 'waiter' | 'water' | 'bill' | 'clear';
  const active = action === 'clear' ? false : parsed.data.active;

  const table = store.setTableServiceAlert(tableNumber, action, active);

  // Broadcast to staff dashboard
  const io = getIO();
  if (io) {
    io.emit('table:service-alert', {
      tableNumber,
      action,
      active,
      message: action === 'clear' ? `Table #${tableNumber} alert cleared.` : `Table #${tableNumber} requested ${action.toUpperCase()}!`,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: action === 'clear' ? `Alerts cleared for Table #${tableNumber}` : `Staff alerted for Table #${tableNumber} (${action}).`,
    data: table,
  });
};
