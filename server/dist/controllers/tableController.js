"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerTableAlert = exports.getTableByNumber = exports.getTables = void 0;
const store_1 = require("../services/store");
const server_1 = require("../server");
const getTables = (_req, res) => {
    const tables = store_1.store.getTables();
    res.json({ success: true, count: tables.length, data: tables });
};
exports.getTables = getTables;
const getTableByNumber = (req, res) => {
    const tableNumber = Number(req.params.tableNumber);
    const table = store_1.store.getTableByNumber(tableNumber);
    if (!table) {
        return res.status(404).json({ success: false, message: `Table #${tableNumber} not found.` });
    }
    res.json({ success: true, data: table });
};
exports.getTableByNumber = getTableByNumber;
const triggerTableAlert = (req, res) => {
    const tableNumber = Number(req.params.tableNumber);
    const { action, active = true } = req.body; // action: 'waiter' | 'water' | 'bill'
    if (!['waiter', 'water', 'bill'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Action must be waiter, water, or bill.' });
    }
    const table = store_1.store.setTableServiceAlert(tableNumber, action, Boolean(active));
    if (!table) {
        return res.status(404).json({ success: false, message: `Table #${tableNumber} not found.` });
    }
    // Real-time broadcast to staff dashboard
    if (server_1.io) {
        server_1.io.emit('table:service-alert', {
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
exports.triggerTableAlert = triggerTableAlert;
