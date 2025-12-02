import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { fetchDiningHalls, fetchMenuItems } from "@/services/api";
import { DiningHall, MenuItem, DayMenu } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { API_ENDPOINTS, API_URL } from "@/constants/API";

interface MenuScheduleResponse {
  hall: string;
  schedule: DayMenu[];
}

export default function DishResultsScreen() {
  const params = useLocalSearchParams<{
    hallId: string;
    hallName: string;
    searchQuery: string;
    mealPeriod?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(180);
  const [cbordUnitId, setCbordUnitId] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<DayMenu[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.hallId || !params.searchQuery) return;

      try {
        setLoading(true);
        setError(null);

        // Get the dining hall to get its cbordUnitId
        const halls = await fetchDiningHalls();
        const hall = halls.find(
          (h: DiningHall) => h.id === Number(params.hallId)
        );
        if (!hall) {
          throw new Error("Dining hall not found");
        }
        setCbordUnitId(hall.cbordUnitId);

        // Fetch the schedule to get today's menu
        const response = await fetch(
          `${API_URL}${API_ENDPOINTS.MENU_SCHEDULE(Number(params.hallId))}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch schedule: ${response.statusText}`);
        }

        const data: MenuScheduleResponse = await response.json();
        setSchedule(data.schedule || []);

        // Get today's date in the same format as the schedule (e.g., "Tuesday, November 11, 2025")
        const today = new Date();
        const todayFormatted = today.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        // Find today's menu - the schedule uses formatted date strings like "Tuesday, November 11, 2025"
        // We'll match by checking if the date contains today's month, day, and year
        const todayMonth = today.toLocaleDateString("en-US", { month: "long" });
        const todayDay = today.getDate();
        const todayYear = today.getFullYear();
        
        const todayMenu = data.schedule.find((day: DayMenu) => {
          // Check if the date string contains today's month, day, and year
          const dateStr = day.date.toLowerCase();
          return (
            dateStr.includes(todayMonth.toLowerCase()) &&
            dateStr.includes(todayDay.toString()) &&
            dateStr.includes(todayYear.toString())
          );
        });

        if (!todayMenu || !todayMenu.meals || todayMenu.meals.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        // If mealPeriod is specified, only fetch that meal
        // Otherwise, fetch all meals from today
        const mealsToFetch = params.mealPeriod
          ? todayMenu.meals.filter((meal) => 
              meal.name.toLowerCase().includes(params.mealPeriod!.toLowerCase())
            )
          : todayMenu.meals;

        // Fetch menu items from all relevant meals
        const allItems: MenuItem[] = [];
        const searchQueryLower = params.searchQuery.toLowerCase();

        for (const meal of mealsToFetch) {
          if (meal.id) {
            try {
              const mealItems = await fetchMenuItems(meal.id, hall.cbordUnitId);
              // Filter items that contain the search query
              const matchingItems = mealItems.filter((item: MenuItem) =>
                item.name.toLowerCase().includes(searchQueryLower)
              );
              allItems.push(...matchingItems);
            } catch (err) {
              console.log(`Could not fetch items for meal ${meal.id}`);
            }
          }
        }

        // Remove duplicates (same dish might appear in multiple meal periods)
        const uniqueItems = allItems.filter((item, index, self) =>
          index === self.findIndex((t) => t.name === item.name)
        );

        setItems(uniqueItems);
      } catch (err: any) {
        setError(err.message || "Failed to load dishes");
        console.error("Error fetching dishes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.hallId, params.searchQuery, params.mealPeriod]);

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  // Get today's date for display
  const today = new Date();
  const todayDateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Fixed Header */}
      <View
        onLayout={handleHeaderLayout}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Header searchText="" setSearchText={() => {}} hideSearch={true} />
      </View>

      {/* Scrollable Content */}
      <FlatList
        contentContainerStyle={{
          paddingTop: headerHeight + 20,
          paddingBottom: bottomNavHeight,
          paddingHorizontal: 20,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search")}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.hallTitle}>
                {params.hallName || "Dining Hall"}
              </Text>
              <Text style={styles.mealTitle}>
                {params.mealPeriod || "All Meals"} - {todayDateStr}
              </Text>
            </View>
          </View>
        }
        data={items}
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
              <Text style={styles.caloriesText}>{item.calories} calories</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#D4A574" />
              <Text style={styles.emptyText}>Loading dishes...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle" size={48} color="#f44336" />
              <Text style={styles.emptyTitle}>Error</Text>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="search" size={48} color="#ddd" />
              <Text style={styles.emptyTitle}>
                No dishes found containing "{params.searchQuery}"
              </Text>
              <Text style={styles.emptyText}>
                Try searching for a different dish name
              </Text>
            </View>
          )
        }
        scrollEnabled={true}
      />

      {/* Fixed Bottom Nav */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
        }}
      >
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
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
  itemCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: "100%",
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
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

