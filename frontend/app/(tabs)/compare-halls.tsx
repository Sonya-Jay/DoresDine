import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { fetchDiningHalls, fetchMenuItems } from "@/services/api";
import { DiningHall, MenuItem } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

type MealType = "breakfast" | "lunch" | "dinner";

export default function CompareHallsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [halls, setHalls] = useState<DiningHall[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [selectedHall1, setSelectedHall1] = useState<DiningHall | null>(null);
  const [selectedHall2, setSelectedHall2] = useState<DiningHall | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Menu items for comparison
  const [hall1Items, setHall1Items] = useState<MenuItem[]>([]);
  const [hall2Items, setHall2Items] = useState<MenuItem[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  
  // UI state
  const [showingComparison, setShowingComparison] = useState(false);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const data = await fetchDiningHalls();
        setHalls(data);
      } catch (err) {
        console.error("Error fetching halls:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const handleCompare = async () => {
    if (!selectedHall1 || !selectedHall2) return;

    try {
      setLoadingMenus(true);
      
      // Format date as YYYY-MM-DD
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Fetch menu items for both halls
      const [items1, items2] = await Promise.all([
        fetchMenuItems(selectedHall1.id, selectedMealType, dateStr),
        fetchMenuItems(selectedHall2.id, selectedMealType, dateStr),
      ]);

      setHall1Items(items1);
      setHall2Items(items2);
      setShowingComparison(true);
    } catch (err) {
      console.error("Error fetching menus:", err);
    } finally {
      setLoadingMenus(false);
    }
  };

  const handleReset = () => {
    setShowingComparison(false);
    setSelectedHall1(null);
    setSelectedHall2(null);
    setHall1Items([]);
    setHall2Items([]);
  };

  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  // Show comparison view
  if (showingComparison) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Header with back button */}
        <View style={styles.comparisonHeader}>
          <TouchableOpacity onPress={handleReset} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.comparisonHeaderText}>
            <Text style={styles.comparisonTitle}>Menu Comparison</Text>
            <Text style={styles.comparisonSubtitle}>
              {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} • {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Split screen menus */}
        <View style={[styles.splitContainer, { paddingBottom: bottomNavHeight }]}>
          {/* Hall 1 Menu */}
          <View style={styles.halfScreen}>
            <View style={styles.hallHeader}>
              <Text style={styles.hallName}>{selectedHall1?.name}</Text>
            </View>
            <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
              {hall1Items.length > 0 ? (
                hall1Items.map((item, idx) => (
                  <View key={idx} style={styles.menuItem}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    {item.allergens && item.allergens.length > 0 && (
                      <Text style={styles.menuItemAllergens}>
                        {item.allergens.join(", ")}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noItemsText}>No menu items available</Text>
              )}
            </ScrollView>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Hall 2 Menu */}
          <View style={styles.halfScreen}>
            <View style={styles.hallHeader}>
              <Text style={styles.hallName}>{selectedHall2?.name}</Text>
            </View>
            <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
              {hall2Items.length > 0 ? (
                hall2Items.map((item, idx) => (
                  <View key={idx} style={styles.menuItem}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    {item.allergens && item.allergens.length > 0 && (
                      <Text style={styles.menuItemAllergens}>
                        {item.allergens.join(", ")}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noItemsText}>No menu items available</Text>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Bottom Nav */}
        <View style={styles.bottomNav}>
          <BottomNav />
        </View>
      </View>
    );
  }

  // Show selection view
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Dining Halls</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingBottom: bottomNavHeight + 20 }]}
      >
        {/* Select First Hall */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>First Dining Hall</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#D4A574" />
          ) : (
            <View style={styles.hallGrid}>
              {halls.map((hall) => (
                <TouchableOpacity
                  key={hall.id}
                  style={[
                    styles.hallOption,
                    selectedHall1?.id === hall.id && styles.hallOptionSelected,
                  ]}
                  onPress={() => setSelectedHall1(hall)}
                >
                  <Text
                    style={[
                      styles.hallOptionText,
                      selectedHall1?.id === hall.id && styles.hallOptionTextSelected,
                    ]}
                  >
                    {hall.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Select Second Hall */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Second Dining Hall</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#D4A574" />
          ) : (
            <View style={styles.hallGrid}>
              {halls.map((hall) => (
                <TouchableOpacity
                  key={hall.id}
                  style={[
                    styles.hallOption,
                    selectedHall2?.id === hall.id && styles.hallOptionSelected,
                  ]}
                  onPress={() => setSelectedHall2(hall)}
                  disabled={selectedHall1?.id === hall.id}
                >
                  <Text
                    style={[
                      styles.hallOptionText,
                      selectedHall2?.id === hall.id && styles.hallOptionTextSelected,
                      selectedHall1?.id === hall.id && styles.hallOptionTextDisabled,
                    ]}
                  >
                    {hall.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Select Meal Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Meal Type</Text>
          <View style={styles.mealTypeRow}>
            {(["breakfast", "lunch", "dinner"] as MealType[]).map((mealType) => (
              <TouchableOpacity
                key={mealType}
                style={[
                  styles.mealTypeOption,
                  selectedMealType === mealType && styles.mealTypeOptionSelected,
                ]}
                onPress={() => setSelectedMealType(mealType)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    selectedMealType === mealType && styles.mealTypeTextSelected,
                  ]}
                >
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Select Date */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date</Text>
          <View style={styles.dateRow}>
            {[-1, 0, 1].map((dayOffset) => {
              const date = new Date();
              date.setDate(date.getDate() + dayOffset);
              const isSelected = selectedDate.toDateString() === date.toDateString();
              
              return (
                <TouchableOpacity
                  key={dayOffset}
                  style={[
                    styles.dateOption,
                    isSelected && styles.dateOptionSelected,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {dayOffset === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Compare Button */}
        <TouchableOpacity
          style={[
            styles.compareButton,
            (!selectedHall1 || !selectedHall2) && styles.compareButtonDisabled,
          ]}
          onPress={handleCompare}
          disabled={!selectedHall1 || !selectedHall2 || loadingMenus}
        >
          {loadingMenus ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.compareButtonText}>Compare Menus</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
  },
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },
  hallGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  hallOption: {
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  hallOptionSelected: {
    borderColor: "#D4A574",
    backgroundColor: "#FFFBF5",
  },
  hallOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  hallOptionTextSelected: {
    color: "#D4A574",
    fontWeight: "600",
  },
  hallOptionTextDisabled: {
    color: "#ccc",
  },
  mealTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealTypeOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  mealTypeOptionSelected: {
    borderColor: "#D4A574",
    backgroundColor: "#FFFBF5",
  },
  mealTypeText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
  },
  mealTypeTextSelected: {
    color: "#D4A574",
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  dateOptionSelected: {
    borderColor: "#D4A574",
    backgroundColor: "#FFFBF5",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  dateTextSelected: {
    color: "#D4A574",
    fontWeight: "600",
  },
  compareButton: {
    backgroundColor: "#D4A574",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  compareButtonDisabled: {
    backgroundColor: "#ccc",
  },
  compareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  // Comparison view styles
  comparisonHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  comparisonHeaderText: {
    marginLeft: 12,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  comparisonSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  splitContainer: {
    flex: 1,
    flexDirection: "row",
  },
  halfScreen: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  hallHeader: {
    backgroundColor: "#D4A574",
    padding: 12,
    alignItems: "center",
  },
  hallName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    padding: 12,
  },
  menuItem: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  menuItemAllergens: {
    fontSize: 12,
    color: "#999",
  },
  noItemsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});
