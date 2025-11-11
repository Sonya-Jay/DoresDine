"use strict";
// export default router;
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cbordService_1 = __importDefault(require("../services/cbordService"));
const router = (0, express_1.Router)();
/**
 * GET /api/dining/halls
 * Get all dining halls
 */
router.get("/halls", async (req, res) => {
    try {
        const halls = await cbordService_1.default.getDiningHalls();
        res.json(halls);
    }
    catch (error) {
        console.error("Error fetching dining halls:", error);
        res.status(500).json({ error: "Failed to fetch dining halls" });
    }
});
/**
 * GET /api/dining/halls/:id/menu
 * Get menu schedule for a specific dining hall
 * :id is our internal dining hall ID, not the Cbord unit ID
 */
router.get("/halls/:id/menu", async (req, res) => {
    try {
        const hallId = parseInt(req.params.id);
        // Find the dining hall to get its Cbord unit ID
        const halls = await cbordService_1.default.getDiningHalls();
        const hall = halls.find((h) => h.id === hallId);
        if (!hall) {
            return res.status(404).json({ error: "Dining hall not found" });
        }
        const menuSchedule = await cbordService_1.default.getMenuSchedule(hall.cbordUnitId);
        res.json({
            hall: hall.name,
            schedule: menuSchedule,
        });
    }
    catch (error) {
        console.error("Error fetching menu schedule:", error);
        res.status(500).json({ error: "Failed to fetch menu schedule" });
    }
});
/**
 * GET /api/dining/menu/:menuId/items
 * Get detailed menu items for a specific meal
 * To be implemented later
 */
router.get("/menu/:menuId/items", async (req, res) => {
    try {
        const menuId = parseInt(req.params.menuId);
        const cbordUnitId = parseInt(req.query.unitId);
        if (isNaN(menuId)) {
            return res.status(400).json({ error: "Invalid menu ID" });
        }
        const items = await cbordService_1.default.getMenuItems(menuId, cbordUnitId);
        res.json(items || []);
    }
    catch (error) {
        console.error("Error fetching menu items:", error);
        res
            .status(500)
            .json({ error: error?.message || "Falied to fetch menu items" });
    }
});
exports.default = router;
