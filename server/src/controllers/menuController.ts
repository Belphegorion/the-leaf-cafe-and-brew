import { Request, Response } from 'express';
import { store } from '../services/store';

export const getCategories = (_req: Request, res: Response) => {
  const categories = store.getCategories();
  res.json({ success: true, data: categories });
};

export const getMenuItems = (req: Request, res: Response) => {
  const { category, search, tag } = req.query;
  const items = store.getMenuItems(
    category as string | undefined,
    search as string | undefined,
    tag as string | undefined
  );
  res.json({ success: true, count: items.length, data: items, items: items });
};

export const getMenuItemById = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = store.getMenuItemById(id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  res.json({ success: true, data: item });
};

export const toggleItemAvailability = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = store.toggleMenuItemAvailability(id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  res.json({ success: true, message: `Item marked as ${item.isAvailable ? 'available' : 'sold out'}`, data: item });
};
