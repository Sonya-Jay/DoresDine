import { DiningHall } from "../types";

// Dining halls list matching the backend cbordService.ts
export const DINING_HALLS: DiningHall[] = [
  { id: 1, name: "Rand Dining Center", cbordUnitId: 1 },
  { id: 2, name: "The Commons Dining Center", cbordUnitId: 2 },
  { id: 3, name: "The Kitchen at Kissam", cbordUnitId: 3 },
  { id: 4, name: "The Pub at Overcup Oak", cbordUnitId: 4 },
  { id: 5, name: "Vandy Blenz", cbordUnitId: 5 },
  { id: 6, name: "Suzie's Food for Thought Cafe", cbordUnitId: 6 },
  { id: 7, name: "Suzie's Blair School of Music", cbordUnitId: 7 },
  { id: 8, name: "Suzie's MRB II", cbordUnitId: 8 },
  { id: 9, name: "Grins Vegetarian Cafe", cbordUnitId: 9 },
  { id: 10, name: "Suzie's Featheringill", cbordUnitId: 10 },
  { id: 11, name: "Holy Smokes Kosher Food Truck", cbordUnitId: 11 },
  { id: 12, name: "E. Bronson Ingram Dining Center", cbordUnitId: 12 },
  { id: 13, name: "Commons Munchie", cbordUnitId: 13 },
  { id: 14, name: "Kissam Munchie", cbordUnitId: 14 },
  { id: 15, name: "Highland Munchie", cbordUnitId: 15 },
  { id: 16, name: "Highland Hotline", cbordUnitId: 16 },
  { id: 17, name: "Local Java Cafe at Alumni", cbordUnitId: 17 },
  { id: 18, name: "Wasabi", cbordUnitId: 18 },
  { id: 19, name: "Zeppos Dining", cbordUnitId: 19 },
  { id: 20, name: "Rothschild Dining Center", cbordUnitId: 20 },
  { id: 21, name: "Cafe Carmichael", cbordUnitId: 21 },
];

export const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Late Night",
  "Brunch",
] as const;

export type MealType = (typeof MEAL_TYPES)[number];
