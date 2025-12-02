import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { RatedItem } from "../types";
import RatingSlider from "./RatingSlider";

interface RatedItemsListProps {
  ratedItems: RatedItem[];
  onRatedItemsChange: (items: RatedItem[]) => void;
}

const RatedItemsList: React.FC<RatedItemsListProps> = ({
  ratedItems,
  onRatedItemsChange,
}) => {
  const addRatedItem = () => {
    onRatedItemsChange([...ratedItems, { menuItemName: "", rating: 5.0 }]);
  };

  const removeRatedItem = (index: number) => {
    const updated = ratedItems.filter((_, i) => i !== index);
    onRatedItemsChange(updated);
  };

  const updateItemName = (index: number, name: string) => {
    const updated = [...ratedItems];
    updated[index] = { ...updated[index], menuItemName: name };
    onRatedItemsChange(updated);
  };

  const updateItemRating = (index: number, rating: number) => {
    const updated = [...ratedItems];
    updated[index] = { ...updated[index], rating };
    onRatedItemsChange(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>
        RATED ITEMS TEST - YOU SHOULD SEE THIS
      </Text>
      
      {ratedItems.length > 0 && (
        <Text style={styles.sectionTitle}>Additional Items</Text>
      )}
      
      {ratedItems.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNumber}>Item {index + 1}</Text>
            <TouchableOpacity
              onPress={() => removeRatedItem(index)}
              style={styles.removeButton}
            >
              <Icon name="x" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Menu item name (e.g., Caesar Salad)"
            placeholderTextColor="#999"
            value={item.menuItemName}
            onChangeText={(text) => updateItemName(index, text)}
          />

          <View style={styles.ratingContainer}>
            <RatingSlider
              value={item.rating}
              onValueChange={(rating) => updateItemRating(index, rating)}
            />
          </View>
        </View>
      ))}

      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.addButton} onPress={addRatedItem}>
          <Icon name="plus" size={20} color="#D4A574" />
          <Text style={styles.addButtonText}>
            {ratedItems.length === 0
              ? "Rate another item"
              : "Add another item"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  buttonWrapper: {
    width: "100%",
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  itemContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  removeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  ratingContainer: {
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D4A574",
    borderStyle: "dashed",
    backgroundColor: "#FFFBF5",
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#D4A574",
  },
});

export default RatedItemsList;
