import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { searchDishAvailability, DishAvailability, getTrendingDishes, SearchDish } from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

export default function DishSearchScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DishAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(180);
  const [trendingDishes, setTrendingDishes] = useState<SearchDish[]>([]);
  const [showTrending, setShowTrending] = useState(false);

  useEffect(() => {
    if (params.showTrending === "true") {
      setShowTrending(true);
      loadTrendingDishes();
    }
  }, [params.showTrending]);

  const loadTrendingDishes = async () => {
    setLoading(true);
    setError(null);
    try {
      const dishes = await getTrendingDishes(20);
      setTrendingDishes(dishes);
    } catch (err: any) {
      console.error("Error loading trending dishes:", err);
      setError(err.message || "Failed to load trending dishes");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim() || searchText.trim().length < 1) {
      setError("Please enter a dish name to search");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setShowTrending(false); // Hide trending when searching

    try {
      const data = await searchDishAvailability(searchText.trim());
      setResults(data);
    } catch (err: any) {
      console.error("Error searching dish availability:", err);
      setError(err.message || "Failed to search for dish availability");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleHallPress = (hallId: number, hallName: string, mealPeriod?: string) => {
    router.push({
      pathname: "/(tabs)/dish-results",
      params: {
        hallId: hallId.toString(),
        hallName: hallName,
        searchQuery: searchText.trim(),
        mealPeriod: mealPeriod || "",
      },
    });
  };

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
        <Header searchText="" setSearchText={() => {}} hideSearch={true} />
      </View>

      {/* Search Section - Below Header */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + 20,
          paddingBottom: bottomNavHeight,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.searchSection}>
          <Text style={styles.title}>Search for a Dish</Text>
          <Text style={styles.subtitle}>
            Find which dining halls are serving your favorite dish
          </Text>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                placeholder="Enter dish name (e.g., pizza, pasta, salad)"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
                placeholderTextColor="#999"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchText ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText("");
                    setResults(null);
                    setError(null);
                  }}
                  style={styles.clearButton}
                >
                  <Icon name="x" size={18} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#f44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Results */}
          {results && (
            <View style={styles.resultsContainer}>
              {/* Today Section */}
              {results.today.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Icon name="clock" size={18} color="#10B981" />
                    <Text style={styles.sectionTitle}>Available Today</Text>
                  </View>
                  {results.today.map((hall, index) => (
                    <TouchableOpacity
                      key={`today-${hall.hallId}-${index}`}
                      style={styles.resultItem}
                      onPress={() => handleHallPress(hall.hallId, hall.hallName)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.resultIcon}>
                        <Icon name="home" size={20} color="#fff" />
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{hall.hallName}</Text>
                        {hall.mealPeriod && (
                          <Text style={styles.resultSubtitle}>{hall.mealPeriod}</Text>
                        )}
                      </View>
                      <Icon name="chevron-right" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Divider */}
              {results.today.length > 0 && results.later.length > 0 && (
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Available Later</Text>
                  <View style={styles.dividerLine} />
                </View>
              )}

              {/* Later Section */}
              {results.later.length > 0 && (
                <>
                  {results.today.length === 0 && (
                    <View style={styles.sectionHeader}>
                      <Icon name="calendar" size={18} color="#666" />
                      <Text style={styles.sectionTitle}>Available Later</Text>
                    </View>
                  )}
                  {results.later.map((hall, index) => (
                    <TouchableOpacity
                      key={`later-${hall.hallId}-${index}`}
                      style={styles.resultItem}
                      onPress={() => handleHallPress(hall.hallId, hall.hallName, hall.mealPeriod)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.resultIcon, styles.resultIconLater]}>
                        <Icon name="calendar" size={20} color="#fff" />
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{hall.hallName}</Text>
                        <Text style={styles.resultSubtitle}>
                          {hall.date &&
                            new Date(hall.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          {hall.mealPeriod && ` • ${hall.mealPeriod}`}
                        </Text>
                      </View>
                      <Icon name="chevron-right" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* No Results */}
              {results.today.length === 0 && results.later.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Icon name="search" size={48} color="#ddd" />
                  <Text style={styles.emptyTitle}>
                    No dining halls found serving "{searchText}"
                  </Text>
                  <Text style={styles.emptyText}>
                    Try searching for a different dish name
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Trending Dishes */}
          {showTrending && trendingDishes.length > 0 && (
            <View style={styles.trendingContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="trending-up" size={18} color="#D4A574" />
                <Text style={styles.sectionTitle}>Trending Dishes</Text>
              </View>
              {trendingDishes.map((dish, index) => (
                <TouchableOpacity
                  key={`trending-${index}`}
                  style={styles.resultItem}
                  onPress={() => {
                    setSearchText(dish.name);
                    setShowTrending(false);
                    handleSearch();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultIcon}>
                    <Icon name="star" size={20} color="#fff" />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{dish.name}</Text>
                    {dish.frequency !== undefined && (
                      <Text style={styles.resultSubtitle}>
                        {dish.frequency} {dish.frequency === 1 ? "post" : "posts"}
                      </Text>
                    )}
                  </View>
                  <Icon name="chevron-right" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Initial State */}
          {!results && !showTrending && !loading && !error && (
            <View style={styles.initialStateContainer}>
              <Icon name="search" size={64} color="#ddd" />
              <Text style={styles.initialStateText}>
                Enter a dish name above and tap "Search" to find where it's available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
  searchSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: "#D4A574",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  resultsContainer: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#D4A574",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resultIconLater: {
    backgroundColor: "#666",
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginTop: 20,
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
  initialStateContainer: {
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },
  initialStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  trendingContainer: {
    marginTop: 8,
  },
});
