import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

export interface FilterOptions {
  allergens: string[];
  mealTypes: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const ALLERGEN_OPTIONS = [
  { id: "nuts", label: "Nuts" },
  { id: "gluten", label: "Gluten" },
  { id: "dairy", label: "Dairy" },
  { id: "eggs", label: "Eggs" },
];

const MEAL_TYPE_OPTIONS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "brunch", label: "Brunch" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "daily-offerings", label: "Daily Offerings" },
];

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    initialFilters?.allergens || []
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(
    initialFilters?.mealTypes || []
  );

  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergenId)
        ? prev.filter((id) => id !== allergenId)
        : [...prev, allergenId]
    );
  };

  const toggleMealType = (mealTypeId: string) => {
    setSelectedMealTypes((prev) =>
      prev.includes(mealTypeId)
        ? prev.filter((id) => id !== mealTypeId)
        : [...prev, mealTypeId]
    );
  };

  const handleClear = () => {
    setSelectedAllergens([]);
    setSelectedMealTypes([]);
  };

  const handleApply = () => {
    onApply({
      allergens: selectedAllergens,
      mealTypes: selectedMealTypes,
    });
    onClose();
  };

  const hasActiveFilters =
    selectedAllergens.length > 0 || selectedMealTypes.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Allergen Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Exclude Allergens</Text>
              <Text style={styles.sectionDescription}>
                Hide menu items containing these allergens
              </Text>
              <View style={styles.optionsGrid}>
                {ALLERGEN_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      selectedAllergens.includes(option.id) &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => toggleAllergen(option.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedAllergens.includes(option.id) &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedAllergens.includes(option.id) && (
                      <Icon name="check" size={16} color="#fff" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Meal Type Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Meal Types</Text>
              <Text style={styles.sectionDescription}>
                Show menu items from specific meal periods
              </Text>
              <View style={styles.optionsGrid}>
                {MEAL_TYPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      selectedMealTypes.includes(option.id) &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => toggleMealType(option.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedMealTypes.includes(option.id) &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedMealTypes.includes(option.id) && (
                      <Icon name="check" size={16} color="#fff" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.clearButton]}
              onPress={handleClear}
              disabled={!hasActiveFilters}
            >
              <Text
                style={[
                  styles.clearButtonText,
                  !hasActiveFilters && styles.disabledButtonText,
                ]}
              >
                Clear All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                Apply Filters
                {hasActiveFilters &&
                  ` (${selectedAllergens.length + selectedMealTypes.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  filterSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    minWidth: 100,
    justifyContent: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#D4A574",
    borderColor: "#D4A574",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  checkIcon: {
    marginLeft: 6,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  disabledButtonText: {
    color: "#ccc",
  },
  applyButton: {
    backgroundColor: "#D4A574",
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

export default FilterModal;
