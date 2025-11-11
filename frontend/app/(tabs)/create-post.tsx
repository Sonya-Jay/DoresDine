import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Alert, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { DINING_HALLS, MEAL_TYPES, MealType } from "@/data/diningHalls";
import { DiningHall, PostData } from "@/types";
import { createPost } from "@/services/api";
import CompanionSelector from "@/components/CompanionSelector";
import DiningHallSelector from "@/components/DiningHallSelector";
import MealTypeSelector from "@/components/MealTypeSelector";
import MenuItemSelector from "@/components/MenuItemSelector";
import NotesInput from "@/components/NotesInput";
import PhotoSelector from "@/components/PhotoSelector";
import RatingSlider from "@/components/RatingSlider";

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ diningHall?: string; mealType?: string }>();
  
  const [selectedDiningHall, setSelectedDiningHall] = useState<DiningHall | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5.0);
  const [companions, setCompanions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

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

  const handleSubmit = async () => {
    if (!selectedDiningHall) {
      Alert.alert("Error", "Please select a dining hall");
      return;
    }

    const postData: PostData = {
      restaurantId: selectedDiningHall.id.toString(),
      restaurantName: selectedDiningHall.name,
      date: new Date().toISOString().split("T")[0],
      mealType: selectedMealType || "Lunch",
      menuItems,
      rating,
      companions,
      notes,
      photos,
    };

    try {
      await createPost(postData);
      router.back();
    } catch (error: any) {
      console.error("Error creating post:", error);
      Alert.alert("Error", error.message || "Failed to create post");
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

        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })}
        </Text>

        {/* Menu Item Selector */}
        <MenuItemSelector
          selectedItems={menuItems}
          onItemsChange={setMenuItems}
        />

        {/* Rating Slider */}
        <RatingSlider value={rating} onValueChange={setRating} />

        {/* Companion Selector */}
        <CompanionSelector
          selectedCompanions={companions}
          onCompanionsChange={setCompanions}
        />

        {/* Notes Input */}
        <NotesInput notes={notes} onNotesChange={setNotes} />

        {/* Photo Selector */}
        <PhotoSelector photos={photos} onPhotosChange={setPhotos} />
      </ScrollView>

      {/* Post Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.postButton, !selectedDiningHall && styles.postButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedDiningHall}
        >
          <Text style={styles.postButtonText}>Post</Text>
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
    color: "#666",
    marginBottom: 16,
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
});

