import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Alert, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/Feather";
import { DINING_HALLS, MEAL_TYPES, MealType } from "@/data/diningHalls";
import { DiningHall, PostData, RatedItem } from "@/types";
import { createPost } from "@/services/api";
import CompanionSelector from "@/components/CompanionSelector";
import DiningHallSelector from "@/components/DiningHallSelector";
import MealTypeSelector from "@/components/MealTypeSelector";
import NotesInput from "@/components/NotesInput";
import PhotoSelector from "@/components/PhotoSelector";
import RatingSlider from "@/components/RatingSlider";

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ diningHall?: string; mealType?: string }>();
  
  const [selectedDiningHall, setSelectedDiningHall] = useState<DiningHall | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [ratedItems, setRatedItems] = useState<RatedItem[]>([]);
  const [showAddDishInput, setShowAddDishInput] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [companions, setCompanions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Set initial values from params
  useEffect(() => {
    if (params.diningHall) {
      const diningHall = DINING_HALLS.find((dh) => dh.name === params.diningHall);
      if (diningHall) {
        setSelectedDiningHall(diningHall);
      }
    }
    if (params.mealType) {
      const mealType = MEAL_TYPES.find((mt) => mt === params.mealType);
      if (mealType) {
        setSelectedMealType(mealType);
      }
    }
  }, [params.diningHall, params.mealType]);

  // Reset form when component unmounts or when navigating back
  useEffect(() => {
    return () => {
      // Cleanup function - reset all state when unmounting
      setSelectedDiningHall(null);
      setSelectedMealType(null);
      setSelectedDate(new Date());
      setMenuItems([]);
      setRatedItems([]);
      setShowAddDishInput(false);
      setNewDishName("");
      setCompanions([]);
      setNotes("");
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDiningHall) {
      Alert.alert("Error", "Please select a dining hall");
      return;
    }

    if (isSubmitting) {
      return; // Prevent double submission
    }

    setIsSubmitting(true);

    // Validate that at least one dish is rated
    if (ratedItems.length === 0) {
      Alert.alert("Error", "Please rate at least one dish");
      return;
    }

    // Collect all photos with their associated dish names
    const photosWithDishNames: Array<{
      storage_key: string;
      display_order: number;
      dish_name: string;
    }> = [];
    
    let photoOrder = 0;
    ratedItems.forEach((item) => {
      if (item.photos && item.photos.length > 0) {
        item.photos.forEach((photoKey) => {
          photosWithDishNames.push({
            storage_key: photoKey,
            display_order: photoOrder++,
            dish_name: item.menuItemName,
          });
        });
      }
    });

    // Calculate overall rating as average of dish ratings
    const overallRating = ratedItems.length > 0
      ? ratedItems.reduce((sum, item) => sum + item.rating, 0) / ratedItems.length
      : null;

    console.log(`[Submit] Rated items:`, ratedItems.map(i => `${i.menuItemName}: ${i.rating}`));
    console.log(`[Submit] Overall rating (average):`, overallRating);

    const postData: PostData = {
      restaurantId: selectedDiningHall.id.toString(),
      restaurantName: selectedDiningHall.name,
      date: selectedDate.toISOString().split("T")[0],
      mealType: selectedMealType || "Lunch",
      menuItems: ratedItems.map(item => item.menuItemName), // Keep for backward compatibility
      rating: overallRating ? Math.round(overallRating * 10) / 10 : undefined, // Overall rating as average
      ratedItems: ratedItems.length > 0 ? ratedItems : undefined,
      companions,
      notes,
      photos: photosWithDishNames.map(p => p.storage_key), // Keep for backward compatibility
      photosWithDishNames: photosWithDishNames.length > 0 ? photosWithDishNames : undefined,
    };

    try {
      console.log("Submitting post:", {
        diningHall: postData.restaurantName,
        mealType: postData.mealType,
        ratedItems: postData.ratedItems?.length || 0,
        photosWithDishNames: postData.photosWithDishNames?.length || 0,
      });
      
      await createPost(postData);
      console.log("Post created successfully!");
      
      // Reset all form fields after successful post
      setSelectedDiningHall(null);
      setSelectedMealType(null);
      setSelectedDate(new Date());
      setMenuItems([]);
      setRatedItems([]);
      setShowAddDishInput(false);
      setNewDishName("");
      setCompanions([]);
      setNotes("");
      
      router.back();
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage = error.message || "Failed to create post";
      Alert.alert("Error Creating Post", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="x" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dining Hall Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dining Hall</Text>
          <DiningHallSelector
            diningHalls={DINING_HALLS}
            selectedDiningHall={selectedDiningHall}
            onSelect={setSelectedDiningHall}
          />
        </View>

        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <MealTypeSelector
            mealTypes={MEAL_TYPES}
            selectedMealType={selectedMealType}
            onSelect={setSelectedMealType}
          />
        </View>

        {/* Date Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={18} color="#666" />
            <Text style={styles.dateSelectorText}>
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            <Icon name="chevron-down" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) {
                setSelectedDate(date);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Rated Dishes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Your Dishes</Text>
          {ratedItems.map((item, index) => (
            <View key={`${item.menuItemName}-${index}`} style={styles.ratedItemContainer}>
              <View style={styles.ratedItemHeader}>
                <Text style={styles.ratedItemName}>{item.menuItemName}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setRatedItems((prevItems) => {
                      return prevItems.filter((i) => i.menuItemName !== item.menuItemName);
                    });
                  }}
                  style={styles.removeItemButton}
                >
                  <Icon name="x" size={18} color="#666" />
                </TouchableOpacity>
              </View>
              <RatingSlider
                key={`slider-${item.menuItemName}-${index}`}
                value={item.rating}
                onValueChange={(newRating) => {
                  setRatedItems((prevItems) => {
                    return prevItems.map((prevItem) => {
                      if (prevItem.menuItemName === item.menuItemName) {
                        return { ...prevItem, rating: newRating };
                      }
                      return prevItem;
                    });
                  });
                }}
              />
              {/* Photo Selector for this dish */}
              <View style={styles.dishPhotoSection}>
                <Text style={styles.dishPhotoLabel}>Photos for this dish</Text>
                <PhotoSelector
                  photos={item.photos || []}
                  onPhotosChange={(newPhotos) => {
                    setRatedItems((prevItems) => {
                      return prevItems.map((prevItem) => {
                        if (prevItem.menuItemName === item.menuItemName) {
                          return { ...prevItem, photos: newPhotos };
                        }
                        return prevItem;
                      });
                    });
                  }}
                />
              </View>
            </View>
          ))}
          
          {/* Add Dish Input or Button */}
          {showAddDishInput ? (
            <View style={styles.addDishInputContainer}>
              <TextInput
                style={styles.addDishInput}
                placeholder="Enter dish name..."
                placeholderTextColor="#999"
                value={newDishName}
                onChangeText={setNewDishName}
                autoFocus={true}
              />
              <View style={styles.addDishInputButtons}>
                <TouchableOpacity
                  style={styles.addDishCancelButton}
                  onPress={() => {
                    setShowAddDishInput(false);
                    setNewDishName("");
                  }}
                >
                  <Text style={styles.addDishCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addDishConfirmButton,
                    !newDishName.trim() && styles.addDishConfirmButtonDisabled,
                  ]}
                  onPress={() => {
                    if (newDishName.trim()) {
                      setRatedItems([
                        ...ratedItems,
                        { menuItemName: newDishName.trim(), rating: 5.0, photos: [] },
                      ]);
                      setNewDishName("");
                      setShowAddDishInput(false);
                    }
                  }}
                  disabled={!newDishName.trim()}
                >
                  <Text style={styles.addDishConfirmText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addDishButton}
              onPress={() => setShowAddDishInput(true)}
            >
              <Icon name="plus" size={20} color="#007AFF" style={{ marginRight: 8 }} />
              <Text style={styles.addDishButtonText}>Add Additional Item</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Companion Selector */}
        <CompanionSelector
          selectedCompanions={companions}
          onCompanionsChange={setCompanions}
        />

        {/* Notes Input */}
        <NotesInput notes={notes} onNotesChange={setNotes} />
      </ScrollView>

      {/* Post Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[
            styles.postButton, 
            (!selectedDiningHall || isSubmitting) && styles.postButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedDiningHall || isSubmitting}
        >
          <Text style={styles.postButtonText}>
            {isSubmitting ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#666\",
    marginBottom: 16,
  },
  dateSelector: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  postButton: {
    backgroundColor: "#D4A574",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  ratedItemContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  ratedItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ratedItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  removeItemButton: {
    padding: 4,
  },
  addDishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderStyle: "dashed",
  },
  addDishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  addDishInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addDishInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
    marginBottom: 12,
  },
  addDishInputButtons: {
    flexDirection: "row",
    gap: 8,
  },
  addDishCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  addDishCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  addDishConfirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  addDishConfirmButtonDisabled: {
    opacity: 0.5,
  },
  addDishConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  dishPhotoSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  dishPhotoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
});

