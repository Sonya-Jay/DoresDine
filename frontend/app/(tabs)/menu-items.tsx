import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { fetchMenuItems } from "@/services/api";
import { MenuItem } from "@/types";

export default function MenuItemsScreen() {
  const params = useLocalSearchParams<{
    menuId: string;
    unitId: string;
    mealName: string;
    hallName: string;
    date: string;
  }>();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (!params.menuId || !params.unitId) return;

      try {
        setLoading(true);
        setError(null);
        const menuId = Number(params.menuId);
        const unitId = Number(params.unitId);
        const data = await fetchMenuItems(menuId, unitId);
        setItems(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load menu items");
        console.error("Error fetching menu items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [params.menuId, params.unitId]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        ListHeaderComponent={
          <>
            <Header searchText={searchText} setSearchText={setSearchText} />
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Icon name="arrow-left" size={24} color="#000" />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.hallTitle}>
                  {params.hallName || "Dining Hall"}
                </Text>
                <Text style={styles.mealTitle}>
                  {params.mealName || "Meal"} - {params.date || ""}
                </Text>
              </View>
            </View>
          </>
        }
        data={filteredItems}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.itemDescription}>{item.description}</Text>
            )}
            {item.allergens && item.allergens.length > 0 && (
              <View style={styles.allergensContainer}>
                <Text style={styles.allergensLabel}>Allergens: </Text>
                <Text style={styles.allergensText}>
                  {item.allergens.join(", ")}
                </Text>
              </View>
            )}
            {item.calories && (
              <Text style={styles.caloriesText}>
                {item.calories} calories
              </Text>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (params.menuId && params.unitId) {
                    setLoading(true);
                    fetchMenuItems(
                      Number(params.menuId),
                      Number(params.unitId)
                    )
                      .then((data) => {
                        setItems(data || []);
                        setLoading(false);
                      })
                      .catch((err) => {
                        setError(err.message);
                        setLoading(false);
                      });
                  }
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptyText}>No menu items available</Text>
          )
        }
        scrollEnabled={true}
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  hallTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  mealTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  allergensContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  allergensLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  allergensText: {
    fontSize: 14,
    color: "#666",
  },
  caloriesText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#999",
  },
});

