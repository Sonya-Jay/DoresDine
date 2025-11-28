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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { API_URL, API_ENDPOINTS } from "@/constants/API";
import { fetchDiningHalls } from "@/services/api";
import { DayMenu, DiningHall } from "@/types";

interface MenuScheduleResponse {
  hall: string;
  schedule: DayMenu[];
}

export default function ScheduleDetailsScreen() {
  const params = useLocalSearchParams<{ hallId: string; hallName: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [schedule, setSchedule] = useState<DayMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cbordUnitId, setCbordUnitId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.hallId) return;

      try {
        setLoading(true);
        setError(null);
        
        // First, get the dining hall to get its cbordUnitId
        const halls = await fetchDiningHalls();
        const hall = halls.find((h: DiningHall) => h.id === Number(params.hallId));
        if (hall) {
          setCbordUnitId(hall.cbordUnitId);
        }

        // Then fetch the schedule
        const response = await fetch(
          `${API_URL}${API_ENDPOINTS.MENU_SCHEDULE(Number(params.hallId))}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch schedule: ${response.statusText}`);
        }

        const data: MenuScheduleResponse = await response.json();
        setSchedule(data.schedule || []);
      } catch (err: any) {
        setError(err.message || "Failed to load menu schedule");
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.hallId]);

  // Backend already returns dates formatted as "Tuesday, November 11, 2025"
  // So we can use them directly

  // Calculate header height: safe area + headerTop (40) + margins (12) + searchBar (24+12) + filter (16+3) + paddingBottom (12)
  const headerHeight = Math.max(insets.top, 15) + 40 + 12 + 24 + 12 + 16 + 3 + 12; // ~134px + safe area
  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Fixed Header */}
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}>
        <Header searchText={searchText} setSearchText={setSearchText} />
      </View>
      
      {/* Scrollable Content */}
      <FlatList
        contentContainerStyle={{
          paddingTop: headerHeight + 40, // Reduced from 60 to 40
          paddingBottom: bottomNavHeight,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/menus" as any)}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.hallTitle}>
              {params.hallName || "Dining Hall"}
            </Text>
          </View>
        }
        data={schedule}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        renderItem={({ item }) => (
          <View style={[styles.daySection, { paddingHorizontal: 20 }]}>
            <Text style={styles.dayHeader}>{item.date}</Text>
            {item.meals && item.meals.length > 0 ? (
              item.meals.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={styles.mealButton}
                  onPress={() => {
                    // Navigate to menu items page
                    if (!cbordUnitId) {
                      console.error("cbordUnitId not available");
                      return;
                    }
                    router.push({
                      pathname: "/(tabs)/menu-items" as any,
                      params: {
                        menuId: meal.id.toString(),
                        unitId: cbordUnitId.toString(),
                        mealName: meal.name,
                        hallName: params.hallName || "",
                        date: item.date,
                      },
                    });
                  }}
                >
                  <Text style={styles.mealText}>{meal.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noMealsText}>No meals available</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (params.hallId) {
                    setLoading(true);
                    fetch(
                      `${API_URL}${API_ENDPOINTS.MENU_SCHEDULE(
                        Number(params.hallId)
                      )}`
                    )
                      .then((res) => res.json())
                      .then((data: MenuScheduleResponse) => {
                        setSchedule(data.schedule || []);
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
            <Text style={styles.emptyText}>No schedule available</Text>
          )
        }
        scrollEnabled={true}
      />
      
      {/* Fixed Bottom Nav */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      }}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20, // Keep some padding but less than before
    paddingVertical: 12, // Reduced from 16
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 8, // Reduced from 12 to bring name closer to button
    padding: 4,
  },
  hallTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  daySection: {
    marginTop: 24,
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  mealButton: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  mealText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4A574",
  },
  noMealsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 8,
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

