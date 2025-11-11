import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { API_URL } from "@/constants/API";
import { MenuItem } from "../types";

interface MealItemsProps {
  menuId: number;
  unitId: number;
}

const MealItems: React.FC<MealItemsProps> = ({ menuId, unitId }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/menus/${menuId}/items?unitId=${unitId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }
        const data = await response.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message || "Failed to load items");
        console.error("Error fetching menu items:", err);
      } finally {
        setLoading(false);
      }
    };

    if (menuId && unitId) {
      fetchItems();
    }
  }, [menuId, unitId]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 8 }} />;
  if (error) return <Text style={{ color: "red" }}>{error}</Text>;
  if (!items || items.length === 0)
    return <Text style={{ color: "#666" }}>No items available</Text>;

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => String(i.name) + (i.calories ?? "")}
      renderItem={({ item }) => (
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontWeight: "600" }}>{item.name}</Text>
          {item.description ? <Text>{item.description}</Text> : null}
          {item.calories ? (
            <Text style={{ color: "#666" }}>{item.calories} kcal</Text>
          ) : null}
          {item.allergens && item.allergens.length > 0 ? (
            <Text style={{ color: "#999", fontSize: 12 }}>
              Allergens: {item.allergens.join(", ")}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
};

export default MealItems;
