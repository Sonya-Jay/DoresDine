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
              <Text style={styles.hallTitle}>
                {params.hallName || "Dining Hall"}
              </Text>
            </View>
          </>
        }
        data={schedule}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.daySection}>
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
        contentContainerStyle={styles.listContent}
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
  hallTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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

