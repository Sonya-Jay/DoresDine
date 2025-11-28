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
  detailOid?: number; // Cbord detail ID for fetching nutrition
  // Nutrition details (optional, fetched separately)
  nutrition?: {
    itemName?: string;
    calories?: number;
    caloriesFromFat?: number;
    totalFat?: number;
    saturatedFat?: number;
    transFat?: number;
    cholesterol?: number;
    sodium?: number;
    potassium?: number;
    totalCarbohydrate?: number;
    dietaryFiber?: number;
    sugars?: number;
    protein?: number;
    vitaminA?: number;
    vitaminC?: number;
    calcium?: number;
    iron?: number;
    vitaminD?: number;
    ingredients?: string;
    allergens?: string[];
  };
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}