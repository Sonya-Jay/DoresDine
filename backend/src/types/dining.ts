export interface DiningHall {
  id: number;
  name: string;
  cbordUnitId: number; // The ID used in Cbord API calls
  isOpen?: boolean;
}

export interface MealPeriod {
  id: number; // The menu ID from Cbord (e.g., 8660973)
  name: string; // e.g., "Breakfast", "Lunch", "Dinner"
  date: string;
}

export interface DayMenu {
  date: string;
  meals: MealPeriod[];
}

export interface MenuItem {
  name: string;
  description?: string;
  calories?: number;
  allergens?: string[];
  // Add more nutrition fields as needed
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}