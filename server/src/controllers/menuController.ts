import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../services/store';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { getIO } from '../socket';
import { CategorySlug, DietaryTag, MenuItem } from '../../../shared/types';

export const getCategories = (_req: Request, res: Response) => {
  const categories = store.getCategories();
  res.json({ success: true, data: categories });
};

export const getMenuItems = (req: Request, res: Response) => {
  const { category, search, tag, includeDeleted } = req.query;
  const items = store.getMenuItems(
    category as string | undefined,
    search as string | undefined,
    tag as string | undefined,
    includeDeleted === 'true'
  );
  res.json({ success: true, count: items.length, data: items, items: items });
};

export const getMenuItemById = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = store.getMenuItemById(id);
  if (!item) {
    throw new AppError(`Menu item ${id} not found`, 404, 'NOT_FOUND');
  }
  res.json({ success: true, data: item });
};

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum([
    'coffee',
    'cold-brews',
    'shakes',
    'mojitos-coolers',
    'pizza',
    'pasta',
    'garlic-bread-bruschetta',
    'salads',
    'chinese',
    'sandwiches',
    'desserts',
  ] as [CategorySlug, ...CategorySlug[]]),
  description: z.string().min(5, 'Description is required'),
  price: z.number().min(1, 'Price must be positive'),
  image: z.string().default('/assets/hero.png'),
  tags: z.array(z.string()).default([]),
  prepTimeMinutes: z.number().min(1).default(15),
  sortOrder: z.number().optional(),
  isAvailable: z.boolean().default(true),
  customizations: z.array(z.any()).optional(),
});

export const createMenuItem = (req: AuthenticatedRequest, res: Response) => {
  const parsed = menuItemSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid menu item data', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const created = store.createMenuItem(parsed.data as any);

  if (req.user) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: 'CREATE_MENU_ITEM',
      entity: 'MenuItem',
      entityId: created.id,
      after: created,
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  const io = getIO();
  if (io) {
    io.emit('menu:updated', { action: 'create', item: created, timestamp: new Date().toISOString() });
  }

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: created,
  });
};

export const updateMenuItem = (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const parsed = menuItemSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid update data', 400, 'VALIDATION_ERROR', parsed.error.format());
  }

  const before = store.getMenuItemById(id);
  const updated = store.updateMenuItem(id, parsed.data as any);

  if (req.user) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: 'UPDATE_MENU_ITEM',
      entity: 'MenuItem',
      entityId: id,
      before,
      after: updated,
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  const io = getIO();
  if (io) {
    io.emit('menu:updated', { action: 'update', item: updated, timestamp: new Date().toISOString() });
  }

  res.json({
    success: true,
    message: 'Menu item updated successfully',
    data: updated,
  });
};

export const deleteMenuItem = (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const before = store.getMenuItemById(id);
  const deleted = store.deleteMenuItem(id);

  if (req.user) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: 'DELETE_MENU_ITEM',
      entity: 'MenuItem',
      entityId: id,
      before,
      after: deleted,
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  const ioDel = getIO();
  if (ioDel) {
    ioDel.emit('menu:updated', { action: 'delete', item: deleted, timestamp: new Date().toISOString() });
  }

  res.json({
    success: true,
    message: 'Menu item soft-deleted successfully (historical orders preserved)',
    data: deleted,
  });
};

export const toggleItemAvailability = (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const before = store.getMenuItemById(id);
  const item = store.toggleMenuItemAvailability(id);

  if (req.user) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: item.isAvailable ? 'ITEM_RESTOCKED' : 'ITEM_86_SOLDOUT',
      entity: 'MenuItem',
      entityId: id,
      before: { isAvailable: before?.isAvailable },
      after: { isAvailable: item.isAvailable },
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  const ioAvail = getIO();
  if (ioAvail) {
    ioAvail.emit('menu:updated', { action: 'availability', item, timestamp: new Date().toISOString() });
  }

  res.json({
    success: true,
    message: `Item marked as ${item.isAvailable ? 'available' : 'sold out (86)'}`,
    data: item,
  });
};

export const exportCsv = (_req: AuthenticatedRequest, res: Response) => {
  const csvData = store.exportMenuCsv();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="the-leaf-menu-${Date.now()}.csv"`);
  res.send(csvData);
};

export const importCsv = (req: AuthenticatedRequest, res: Response) => {
  const { csvContent } = req.body;
  if (!csvContent || typeof csvContent !== 'string') {
    throw new AppError('csvContent string is required in request body.', 400, 'VALIDATION_ERROR');
  }

  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new AppError('CSV must contain a header row and at least one data row.', 400, 'VALIDATION_ERROR');
  }

  const imported: MenuItem[] = [];
  const errors: { row: number; error: string }[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parser supporting quoted strings
    const parts: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        cur = '';
      } else {
        cur += char;
      }
    }
    parts.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

    // Expected format: Name, Category, Price, Description, Tags (semi-colon separated)
    const [name, category, priceStr, description, tagsStr] = parts;
    const price = Number(priceStr);

    if (!name || isNaN(price) || price <= 0) {
      errors.push({ row: i + 1, error: `Invalid name or price: '${name}', '${priceStr}'` });
      continue;
    }

    try {
      const tags = (tagsStr || '').split(';').map(t => t.trim().toLowerCase()).filter(Boolean) as DietaryTag[];
      const created = store.createMenuItem({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category: (category || 'coffee') as CategorySlug,
        description: description || 'Artisanal sanctuary delicacy',
        price,
        isPriceTbc: false,
        image: '/assets/hero.png',
        tags,
        isAvailable: true,
        prepTimeMinutes: 15,
        sortOrder: store.getMenuItems().length + 1,
      });
      imported.push(created);
    } catch (err: any) {
      errors.push({ row: i + 1, error: err.message });
    }
  }

  if (req.user && imported.length > 0) {
    store.addAuditLog({
      actor: { id: req.user.userId, name: req.user.name, role: req.user.role },
      action: 'BULK_IMPORT_CSV',
      entity: 'MenuItem',
      entityId: `batch_${imported.length}`,
      after: { count: imported.length, errorsCount: errors.length },
      ip: req.ip || req.socket.remoteAddress,
    });
  }

  const io = getIO();
  if (io && imported.length > 0) {
    io.emit('menu:updated', { action: 'bulk-import', count: imported.length, timestamp: new Date().toISOString() });
  }

  res.json({
    success: true,
    message: `Imported ${imported.length} items with ${errors.length} errors.`,
    data: {
      importedCount: imported.length,
      errors,
    },
  });
};
