import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { DINING_HALLS, MEAL_TYPES, MealType } from "../data/diningHalls";
import { DiningHall, PostData } from "../types";
import CompanionSelector from "./CompanionSelector";
import DiningHallSelector from "./DiningHallSelector";
import MealTypeSelector from "./MealTypeSelector";
import MenuItemSelector from "./MenuItemSelector";
import NotesInput from "./NotesInput";
import PhotoSelector from "./PhotoSelector";
import RatingSlider from "./RatingSlider";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: PostData) => void;
  initialDiningHall?: string;
  initialMealType?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialDiningHall,
  initialMealType,
}) => {
  const [selectedDiningHall, setSelectedDiningHall] =
    useState<DiningHall | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    null
  );
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5.0);
  const [companions, setCompanions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  // Effect to set initial values when modal opens
  useEffect(() => {
    if (visible) {
      if (initialDiningHall) {
        const diningHall = DINING_HALLS.find(
          (dh) => dh.name === initialDiningHall
        );
        if (diningHall) {
          setSelectedDiningHall(diningHall);
        }
      }

      if (initialMealType) {
        const mealType = MEAL_TYPES.find((mt) => mt === initialMealType);
        if (mealType) {
          setSelectedMealType(mealType);
        }
      }
    }
  }, [visible, initialDiningHall, initialMealType]);

  const handleClose = () => {
    // Reset all form fields when closing
    setSelectedDiningHall(null);
    setSelectedMealType(null);
    setRating(5.0);
    setMenuItems([]);
    setCompanions([]);
    setNotes("");
    setPhotos([]);
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedDiningHall) {
      // Could add validation alert here
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
    
    // Reset all form fields after submitting
    setSelectedDiningHall(null);
    setSelectedMealType(null);
    setRating(5.0);
    setMenuItems([]);
    setCompanions([]);
    setNotes("");
    setPhotos([]);
    
    onSubmit(postData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
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

            {/* Rate Another Item Button */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#D4A574",
                backgroundColor: "#FFFBF5",
                marginBottom: 20,
              }}
              onPress={() => alert('Rate another item clicked! Feature coming soon.')}
            >
              <Icon name="plus" size={20} color="#D4A574" />
              <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "600", color: "#D4A574" }}>
                Rate another item
              </Text>
            </TouchableOpacity>

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
          <TouchableOpacity
            style={styles.postButton}
            onPress={handleSubmit}
            disabled={!selectedDiningHall}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    width: "100%",
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
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
  closeButton: {
    padding: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  postButton: {
    backgroundColor: "#D4A574",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default CreatePostModal;
