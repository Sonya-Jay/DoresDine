import BottomNav from "@/components/BottomNav";
import FilterModal, { FilterOptions } from "@/components/FilterModal";
import Header from "@/components/Header";
import { fetchDiningHalls, searchDiningHalls, SearchDiningHall } from "@/services/api";
import { DiningHall } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

// Helper function to determine if a dining hall is open
// Uses the isOpen property from the API, defaults to false if not provided
const isHallOpen = (hall: DiningHall): boolean => {
  return hall.isOpen ?? false;
};

export default function MenusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [halls, setHalls] = useState<DiningHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    allergens: [],
    mealTypes: [],
  });
  const [searchResults, setSearchResults] = useState<SearchDiningHall[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Search dining halls when searchText changes
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search text is empty, clear results
    if (searchText.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const results = await searchDiningHalls(searchText.trim());
        setSearchResults(results);
      } catch (err: any) {
        console.error("Error searching dining halls:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  const handleSearchHallPress = (hall: SearchDiningHall) => {
    setSearchText("");
    setSearchResults([]);
    router.push({
      pathname: "/(tabs)/schedule-details",
      params: {
        hallId: hall.id.toString(),
        hallName: hall.name,
        filterAllergens: JSON.stringify(activeFilters.allergens),
        filterMealTypes: JSON.stringify(activeFilters.mealTypes),
      },
    });
  };

  const filteredHalls = halls.filter((hall) => {
    if (!searchText.trim()) return true;

    // Split hall name into words (by spaces and common punctuation)
    const hallWords = hall.name.toLowerCase().split(/[\s,.-]+/);
    const searchLower = searchText.toLowerCase().trim();

    // Check if any word starts with the search term
    return hallWords.some((word) => word.startsWith(searchLower));
  });

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

  const activeFilterCount =
    activeFilters.allergens.length + activeFilters.mealTypes.length;

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
        <Header
          searchText={searchText}
          setSearchText={setSearchText}
          onFilterPress={() => setFilterModalVisible(true)}
          activeFilterCount={activeFilterCount}
          searchPlaceholder="Search dining facilities"
          disableSearchModal={true}
        />
      </View>

      {/* Search Results Dropdown */}
      {searchText.trim().length >= 1 && (
        <View style={[styles.searchDropdown, { top: headerHeight }]}>
          {searchLoading ? (
            <View style={styles.searchDropdownLoading}>
              <ActivityIndicator size="small" color="#D4A574" />
              <Text style={styles.searchDropdownLoadingText}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <ScrollView 
              style={styles.searchDropdownScroll}
              keyboardShouldPersistTaps="handled"
            >
              {searchResults.map((hall) => (
                <TouchableOpacity
                  key={hall.id}
                  style={styles.searchResultItem}
                  onPress={() => handleSearchHallPress(hall)}
                  activeOpacity={0.7}
                >
                  <View style={styles.searchResultIcon}>
                    <Icon name="home" size={20} color="#fff" />
                  </View>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{hall.name}</Text>
                    <Text style={styles.searchResultSubtitle}>Dining Hall</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.searchDropdownEmpty}>
              <Text style={styles.searchDropdownEmptyText}>No dining halls found</Text>
            </View>
          )}
        </View>
      )}

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
          ) : null
        }
        showsVerticalScrollIndicator={false}
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
  searchDropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 400,
    zIndex: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchDropdownScroll: {
    maxHeight: 400,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  searchResultIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchDropdownLoading: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchDropdownLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  searchDropdownEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  searchDropdownEmptyText: {
    fontSize: 14,
    color: '#999',
  },
});
