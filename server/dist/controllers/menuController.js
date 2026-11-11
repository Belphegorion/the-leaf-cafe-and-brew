"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleItemAvailability = exports.getMenuItemById = exports.getMenuItems = exports.getCategories = void 0;
const store_1 = require("../services/store");
const getCategories = (_req, res) => {
    const categories = store_1.store.getCategories();
    res.json({ success: true, data: categories });
};
exports.getCategories = getCategories;
const getMenuItems = (req, res) => {
    const { category, search, tag } = req.query;
    const items = store_1.store.getMenuItems(category, search, tag);
    res.json({ success: true, count: items.length, data: items });
};
exports.getMenuItems = getMenuItems;
const getMenuItemById = (req, res) => {
    const { id } = req.params;
    const item = store_1.store.getMenuItemById(id);
    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
};
exports.getMenuItemById = getMenuItemById;
const toggleItemAvailability = (req, res) => {
    const { id } = req.params;
    const item = store_1.store.toggleMenuItemAvailability(id);
    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: `Item marked as ${item.isAvailable ? 'available' : 'sold out'}`, data: item });
};
exports.toggleItemAvailability = toggleItemAvailability;
