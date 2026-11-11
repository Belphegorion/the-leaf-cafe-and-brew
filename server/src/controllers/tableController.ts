import { Request, Response } from 'express';
import { store } from '../services/store';
import { io } from '../server';

export const getTables = (_req: Request, res: Response) => {
  const tables = store.getTables();
  res.json({ success: true, count: tables.length, data: tables, tables: tables });
};

export const getTableByNumber = (req: Request, res: Response) => {
  const tableNumber = Number(req.params.tableNumber);
  const table = store.getTableByNumber(tableNumber);
  if (!table) {
    return res.status(404).json({ success: false, message: `Table #${tableNumber} not found.` });
  }
  res.json({ success: true, data: table });
};

export const triggerTableAlert = (req: Request, res: Response) => {
  const tableNumber = Number(req.params.tableNumber);
  const { action, active = true } = req.body; // action: 'waiter' | 'water' | 'bill'

  if (!['waiter', 'water', 'bill'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be waiter, water, or bill.' });
  }

  const table = store.setTableServiceAlert(tableNumber, action, Boolean(active));
  if (!table) {
    return res.status(404).json({ success: false, message: `Table #${tableNumber} not found.` });
  }

  // Real-time broadcast to staff dashboard
  if (io) {
    io.emit('table:service-alert', {
      tableNumber,
      action,
      active,
      message: `Table #${tableNumber} requested ${action.toUpperCase()}!`,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: `Staff alerted for Table #${tableNumber} (${action}).`,
    data: table,
  });
};
