// export default router;

import { Router } from "express";
import cbordService from "../services/cbordService";

const router = Router();

/**
 * GET /api/dining/halls
 * Get all dining halls
 */
router.get("/halls", async (req, res) => {
  try {
    const halls = await cbordService.getDiningHalls();
    res.json(halls);
  } catch (error) {
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
    const halls = await cbordService.getDiningHalls();
    const hall = halls.find((h) => h.id === hallId);

    if (!hall) {
      return res.status(404).json({ error: "Dining hall not found" });
    }

    const menuSchedule = await cbordService.getMenuSchedule(hall.cbordUnitId);
    res.json({
      hall: hall.name,
      schedule: menuSchedule,
    });
  } catch (error) {
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
    const cbordUnitId = parseInt(req.query.unitId as string);
    if (isNaN(menuId)) {
      return res.status(400).json({ error: "Invalid menu ID" });
    }
    const items = await cbordService.getMenuItems(menuId, cbordUnitId);
    res.json(items || []);
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ error: error?.message || "Falied to fetch menu items" });
  }
});

/**
 * GET /api/dining/nutrition/:detailOid
 * Get detailed nutrition information for a specific menu item
 * @param detailOid - The detail ID from the menu item (extracted from menu items)
 * @query unitId - Optional: Cbord unit ID (helps with session setup)
 * @query menuId - Optional: Menu ID (helps with session setup)
 */
router.get("/nutrition/:detailOid", async (req, res) => {
  try {
    const detailOid = parseInt(req.params.detailOid);
    if (isNaN(detailOid)) {
      return res.status(400).json({ error: "Invalid detail ID" });
    }
    
    // Get optional unit and menu IDs from query params
    const unitId = req.query.unitId ? parseInt(req.query.unitId as string) : undefined;
    const menuId = req.query.menuId ? parseInt(req.query.menuId as string) : undefined;
    
    const nutrition = await cbordService.getItemNutrition(detailOid, unitId, menuId);
    if (!nutrition) {
      return res.status(404).json({ error: "Nutrition information not found" });
    }
    res.json(nutrition);
  } catch (error: any) {
    console.error("Error fetching nutrition:", error);
    res.status(500).json({ error: error?.message || "Failed to fetch nutrition information" });
  }
});

export default router;
