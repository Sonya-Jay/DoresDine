import { useRouter } from "expo-router";
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
import { fetchDiningHalls } from "@/services/api";
import { DiningHall } from "@/types";

// Helper function to determine if a dining hall is open (placeholder logic)
// In a real app, this would check the schedule API
const isHallOpen = (hallName: string): boolean => {
  // Placeholder: some halls are closed, most are open
  const closedHalls = [
    "E. Bronson Ingram Dining Center",
    "Cafe Carmichael",
  ];
  return !closedHalls.includes(hallName);
};

export default function MenusScreen() {
  const [searchText, setSearchText] = useState("");
  const [halls, setHalls] = useState<DiningHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const data = await fetchDiningHalls();
        setHalls(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dining halls");
        console.error("Error fetching halls:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const filteredHalls = halls.filter((hall) =>
    hall.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleHallPress = (hall: DiningHall) => {
    router.push({
      pathname: "/(tabs)/schedule-details" as any,
      params: { hallId: hall.id.toString(), hallName: hall.name },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        ListHeaderComponent={
          <>
            <Header searchText={searchText} setSearchText={setSearchText} />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dining Facilities</Text>
            </View>
          </>
        }
        data={filteredHalls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isOpen = isHallOpen(item.name);
          return (
            <TouchableOpacity
              style={styles.facilityCard}
              onPress={() => handleHallPress(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.facilityName}>{item.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  isOpen ? styles.statusOpen : styles.statusClosed,
                ]}
              >
                <Text style={styles.statusText}>
                  {isOpen ? "Open" : "Closed"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={{ padding: 16, color: "red", textAlign: "center" }}>
              {error}
            </Text>
          ) : (
            <Text style={{ padding: 16, textAlign: "center", color: "#999" }}>
              No dining halls found.
            </Text>
          )
        }
        scrollEnabled={true}
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  facilityCard: {
    backgroundColor: "#D4A574",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 70,
    alignItems: "center",
  },
  statusOpen: {
    backgroundColor: "#10B981",
  },
  statusClosed: {
    backgroundColor: "#EF4444",
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

