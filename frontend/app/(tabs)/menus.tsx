import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import FilterModal, { FilterOptions } from "@/components/FilterModal";
import { fetchDiningHalls } from "@/services/api";
import { DiningHall } from "@/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper function to determine if a dining hall is open
// Uses the isOpen property from the API, defaults to false if not provided
const isHallOpen = (hall: DiningHall): boolean => {
  return hall.isOpen ?? false;
};

export default function MenusScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [halls, setHalls] = useState<DiningHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    allergens: [],
    mealTypes: [],
  });
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
      params: { 
        hallId: hall.id.toString(), 
        hallName: hall.name,
        filterAllergens: JSON.stringify(activeFilters.allergens),
        filterMealTypes: JSON.stringify(activeFilters.mealTypes),
      },
    });
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const activeFilterCount = activeFilters.allergens.length + activeFilters.mealTypes.length;

  const [headerHeight, setHeaderHeight] = useState(180);
  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Fixed Header */}
      <View 
        onLayout={handleHeaderLayout}
        style={{ 
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
        }}
      >
        <Header 
          searchText={searchText} 
          setSearchText={setSearchText}
          onFilterPress={() => setFilterModalVisible(true)}
          activeFilterCount={activeFilterCount}
        />
      </View>
      
      {/* Scrollable Content */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingTop: headerHeight + 20, // Header + reduced section header spacing
          paddingBottom: bottomNavHeight,
        }}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dining Facilities</Text>
          </View>
        }
        data={filteredHalls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isOpen = isHallOpen(item);
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
        showsVerticalScrollIndicator={false}
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

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={activeFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  facilityCard: {
    backgroundColor: "#D4A574",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    marginHorizontal: 20,
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

