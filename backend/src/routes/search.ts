import { Request, Response, Router } from "express";
import pool from "../db";
import cbordService from "../services/cbordService";
import { DINING_HALLS } from "../services/cbordService";

const router = Router();

// GET /search - Search for dining halls, users, and dishes
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = ((req.query.q as string) || "").trim().toLowerCase();

    if (!query || query.length < 2) {
      res.status(400).json({ error: "Query must be at least 2 characters" });
      return;
    }

    const [users, diningHalls] = await Promise.all([
      searchUsers(query),
      searchDiningHalls(query),
    ]);

    res.json({
      users,
      diningHalls,
      query,
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ error: "Failed to search" });
  }
});

// GET /search/users - Search for users
router.get("/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = ((req.query.q as string) || "").trim().toLowerCase();

    if (!query || query.length < 1) {
      res.status(400).json({ error: "Query must be at least 1 character" });
      return;
    }

    const users = await searchUsers(query);
    res.json({ users, query });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// GET /search/dining-halls - Search for dining halls
router.get(
  "/dining-halls",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const query = ((req.query.q as string) || "").trim().toLowerCase();

      if (!query || query.length < 1) {
        res.status(400).json({ error: "Query must be at least 1 character" });
        return;
      }

      const diningHalls = await searchDiningHalls(query);
      res.json({ diningHalls, query });
    } catch (error) {
      console.error("Error searching dining halls:", error);
      res.status(500).json({ error: "Failed to search dining halls" });
    }
  }
);

// GET /search/dishes - Search for dishes
router.get("/dishes", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = ((req.query.q as string) || "").trim().toLowerCase();

    if (!query || query.length < 1) {
      res.status(400).json({ error: "Query must be at least 1 character" });
      return;
    }

    // Search through posts for menu items
    const dishes = await searchDishes(query);
    res.json({ dishes, query });
  } catch (error) {
    console.error("Error searching dishes:", error);
    res.status(500).json({ error: "Failed to search dishes" });
  }
});

// GET /search/trending-dishes - Get top trending dishes
router.get(
  "/trending-dishes",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 100); // Max 100

      const dishes = await getTrendingDishes(limit);
      res.json({ dishes });
    } catch (error) {
      console.error("Error fetching trending dishes:", error);
      res.status(500).json({ error: "Failed to fetch trending dishes" });
    }
  }
);

// GET /search/dish-availability - Find which dining halls serve a dish
router.get(
  "/dish-availability",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const query = ((req.query.q as string) || "").trim().toLowerCase();

      if (!query || query.length < 1) {
        res.status(400).json({ error: "Query must be at least 1 character" });
        return;
      }

      const availability = await searchDishAvailability(query);
      res.json(availability);
    } catch (error) {
      console.error("Error searching dish availability:", error);
      res.status(500).json({ error: "Failed to search dish availability" });
    }
  }
);

// Helper functions
async function searchUsers(query: string): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, created_at
       FROM users
       WHERE LOWER(username) LIKE $1 
          OR (first_name IS NOT NULL AND LOWER(first_name) LIKE $1)
          OR (last_name IS NOT NULL AND LOWER(last_name) LIKE $1)
          OR (first_name IS NOT NULL AND last_name IS NOT NULL AND LOWER(first_name || ' ' || last_name) LIKE $1)
          OR LOWER(email) LIKE $1
       ORDER BY 
         CASE 
           WHEN LOWER(username) LIKE $2 THEN 1
           WHEN (first_name IS NOT NULL AND LOWER(first_name) LIKE $2) OR (last_name IS NOT NULL AND LOWER(last_name) LIKE $2) THEN 2
           WHEN (first_name IS NOT NULL AND last_name IS NOT NULL AND LOWER(first_name || ' ' || last_name) LIKE $2) THEN 3
           ELSE 4
         END
       LIMIT 20`,
      [`%${query}%`, `${query}%`]
    );
    return result.rows;
  } catch (error) {
    console.error("Error in searchUsers:", error);
    return [];
  }
}

async function searchDiningHalls(query: string): Promise<any[]> {
  try {
    // First try to get from our database
    const result = await pool.query(
      `SELECT id, name, cbordUnitId
       FROM dining_halls
       WHERE LOWER(name) LIKE $1
       LIMIT 10`,
      [`%${query}%`]
    );

    if (result.rows.length > 0) {
      return result.rows;
    }

    // If not found in DB, get all halls and filter by name
    const allHalls = await cbordService.getDiningHalls();
    return allHalls
      .filter((hall: any) => hall.name.toLowerCase().includes(query))
      .slice(0, 10);
  } catch (error) {
    console.error("Error in searchDiningHalls:", error);
    return [];
  }
}

async function searchDishes(query: string): Promise<any[]> {
  try {
    // Search for menu items from both posts and photo dish names
    const result = await pool.query(
      `SELECT 
         dish_name,
         COUNT(*) as frequency
       FROM (
         -- Get dishes from menu_items array
         SELECT unnest(menu_items) as dish_name 
         FROM posts 
         WHERE menu_items IS NOT NULL
         
         UNION ALL
         
         -- Get dishes from photo dish_names
         SELECT dish_name 
         FROM post_photos 
         WHERE dish_name IS NOT NULL AND dish_name != ''
       ) AS all_dishes
       WHERE LOWER(dish_name) LIKE $1
       GROUP BY dish_name
       ORDER BY frequency DESC
       LIMIT 20`,
      [`%${query}%`]
    );

    // Transform to return the dish names with frequency
    return result.rows.map((row: any) => ({
      name: row.dish_name,
      frequency: parseInt(row.frequency),
    }));
  } catch (error) {
    console.error("Error in searchDishes:", error);
    return [];
  }
}

async function getTrendingDishes(limit: number): Promise<any[]> {
  try {
    // Get top dishes by frequency from both menu_items and photo dish_names
    const result = await pool.query(
      `SELECT 
         dish_name,
         COUNT(*) as frequency
       FROM (
         -- Get dishes from menu_items array
         SELECT unnest(menu_items) as dish_name 
         FROM posts 
         WHERE menu_items IS NOT NULL
         
         UNION ALL
         
         -- Get dishes from photo dish_names
         SELECT dish_name 
         FROM post_photos 
         WHERE dish_name IS NOT NULL AND dish_name != ''
       ) AS all_dishes
       GROUP BY dish_name
       ORDER BY frequency DESC
       LIMIT $1`,
      [limit]
    );

    // Transform to return the dish names with frequency
    return result.rows.map((row: any) => ({
      name: row.dish_name,
      frequency: parseInt(row.frequency),
    }));
  } catch (error) {
    console.error("Error in getTrendingDishes:", error);
    return [];
  }
}

async function searchDishAvailability(query: string): Promise<{
  dish: string;
  today: Array<{ hallId: number; hallName: string; mealPeriod?: string }>;
  later: Array<{ hallId: number; hallName: string; date?: string; mealPeriod?: string }>;
}> {
  const today: Array<{ hallId: number; hallName: string; mealPeriod?: string }> = [];
  const later: Array<{ hallId: number; hallName: string; date?: string; mealPeriod?: string }> = [];
  
  const todayDate = new Date();
  const todayDateStr = todayDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  try {
    // Search all dining halls in parallel (but limit concurrency to avoid overwhelming the API)
    const searchPromises = DINING_HALLS.map(async (hall) => {
      try {
        // Get menu schedule for this hall
        const schedule = await cbordService.getMenuSchedule(hall.cbordUnitId);
        
        // Check today's menu
        const todayMenu = schedule.find(day => {
          const dayDate = new Date(day.date);
          const dayDateStr = dayDate.toISOString().split('T')[0];
          return dayDateStr === todayDateStr;
        });
        
        if (todayMenu) {
          // Check each meal period for today
          for (const period of todayMenu.meals || []) {
            if (period.id) {
              try {
                const items = await cbordService.getMenuItems(period.id, hall.cbordUnitId);
                const found = items.some(item => 
                  item.name.toLowerCase().includes(query)
                );
                
                if (found) {
                  today.push({
                    hallId: hall.id,
                    hallName: hall.name,
                    mealPeriod: period.name,
                  });
                  return; // Found in today, don't check later
                }
              } catch (err) {
                // Skip if we can't fetch items for this meal
                console.log(`Could not fetch items for hall ${hall.id}, meal ${period.id}`);
              }
            }
          }
        }
        
        // If not found today, check future days
        for (const day of schedule) {
          const dayDate = new Date(day.date);
          const dayDateStr = dayDate.toISOString().split('T')[0];
          
          // Skip today (already checked) and past dates
          if (dayDateStr <= todayDateStr) continue;
          
          // Check each meal period
          for (const period of day.meals || []) {
            if (period.id) {
              try {
                const items = await cbordService.getMenuItems(period.id, hall.cbordUnitId);
                const found = items.some(item => 
                  item.name.toLowerCase().includes(query)
                );
                
                if (found) {
                  later.push({
                    hallId: hall.id,
                    hallName: hall.name,
                    date: day.date,
                    mealPeriod: period.name,
                  });
                  return; // Found in this day, move to next hall
                }
              } catch (err) {
                // Skip if we can't fetch items
              }
            }
          }
        }
      } catch (err) {
        // Skip halls that fail
        console.log(`Error checking hall ${hall.name}:`, err);
      }
    });
    
    // Wait for all searches to complete (with timeout)
    await Promise.allSettled(searchPromises);
    
    return {
      dish: query,
      today,
      later,
    };
  } catch (error) {
    console.error("Error in searchDishAvailability:", error);
    return {
      dish: query,
      today: [],
      later: [],
    };
  }
}

export default router;
