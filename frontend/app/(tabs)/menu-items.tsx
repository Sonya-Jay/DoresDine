import BottomNav from "@/components/BottomNav";
import FilterModal, { FilterOptions } from "@/components/FilterModal";
import Header from "@/components/Header";
import { fetchMenuItems, searchDishes, SearchDish } from "@/services/api";
import { MenuItem } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

export default function MenuItemsScreen() {
  const params = useLocalSearchParams<{
    menuId: string;
    unitId: string;
    mealName: string;
    hallName: string;
    date: string;
    filterAllergens?: string;
    filterMealTypes?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    allergens: [],
    mealTypes: [],
  });
  const [searchResults, setSearchResults] = useState<SearchDish[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(180);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse filter params
  const filterAllergens = params.filterAllergens
    ? JSON.parse(params.filterAllergens)
    : [];
  const filterMealTypes = params.filterMealTypes
    ? JSON.parse(params.filterMealTypes)
    : [];

  // Initialize active filters from URL params
  useEffect(() => {
    setActiveFilters({
      allergens: filterAllergens,
      mealTypes: filterMealTypes,
    });
  }, [params.filterAllergens, params.filterMealTypes]);

  // Debug logging
  useEffect(() => {
    console.log("Filter Allergens:", filterAllergens);
    console.log("Filter Meal Types:", filterMealTypes);
  }, [filterAllergens, filterMealTypes]);

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

  const filteredItems = items.filter((item) => {
    // Search filter
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    // Allergen filter - exclude items that contain any of the filtered allergens
    const hasExcludedAllergen =
      activeFilters.allergens.length > 0 &&
      item.allergens &&
      item.allergens.some((allergen: string) => {
        const allergenLower = allergen.toLowerCase();
        return activeFilters.allergens.some((filtered: string) => {
          const filteredLower = filtered.toLowerCase();
          // Check both ways: allergen contains filter OR filter contains allergen
          // This handles "peanut" matching "nuts" and "nuts" matching "peanut"
          return (
            allergenLower.includes(filteredLower) ||
            filteredLower.includes(allergenLower) ||
            // Also handle common allergen variations
            (filteredLower === "nuts" &&
              (allergenLower.includes("nut") ||
                allergenLower.includes("peanut"))) ||
            (filteredLower === "dairy" &&
              (allergenLower.includes("milk") ||
                allergenLower.includes("cheese"))) ||
            (filteredLower === "gluten" && allergenLower.includes("wheat"))
          );
        });
      });

    // Meal type filter - if meal types are selected, check if current meal matches
    // Note: The mealName from params represents the current meal period
    const matchesMealType =
      activeFilters.mealTypes.length === 0 ||
      activeFilters.mealTypes.some((type: string) => {
        const mealNameLower = params.mealName?.toLowerCase() || "";
        const typeLower = type.toLowerCase();

        // Handle "daily-offerings" specially
        if (
          typeLower === "daily-offerings" ||
          typeLower === "daily offerings"
        ) {
          return (
            mealNameLower.includes("daily") || mealNameLower.includes("all day")
          );
        }

        return mealNameLower.includes(typeLower);
      });

    return matchesSearch && !hasExcludedAllergen && matchesMealType;
  });

  const hasActiveFilters =
    activeFilters.allergens.length > 0 || activeFilters.mealTypes.length > 0;
  const activeFilterCount =
    activeFilters.allergens.length + activeFilters.mealTypes.length;

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  // Search dishes when searchText changes
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
        const results = await searchDishes(searchText.trim());
        setSearchResults(results);
      } catch (err: any) {
        console.error("Error searching dishes:", err);
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

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

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
          searchPlaceholder="Search foods"
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
              {searchResults.map((dish, index) => (
                <TouchableOpacity
                  key={`${dish.name}-${index}`}
                  style={styles.searchResultItem}
                  onPress={() => {
                    // Filter items to show only this dish
                    setSearchText("");
                    setSearchResults([]);
                    // The filteredItems will automatically filter by the dish name
                    setSearchText(dish.name);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.searchResultIcon}>
                    <Icon name="coffee" size={20} color="#fff" />
                  </View>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{dish.name}</Text>
                    {dish.frequency && (
                      <Text style={styles.searchResultSubtitle}>
                        {dish.frequency} {dish.frequency === 1 ? 'post' : 'posts'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.searchDropdownEmpty}>
              <Text style={styles.searchDropdownEmptyText}>No dishes found</Text>
            </View>
          )}
        </View>
      )}

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
              onPress={() => router.push("/(tabs)/menus")}
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
                {params.mealName || "Meal"} - {params.date || ""}
              </Text>
            </View>
          </View>
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
              <Text style={styles.caloriesText}>{item.calories} calories</Text>
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
                  if (params.menuId && params.unitId) {
                    setLoading(true);
                    fetchMenuItems(Number(params.menuId), Number(params.unitId))
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
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%',
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
