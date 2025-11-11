import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface MenuItemSelectorProps {
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
}

const MenuItemSelector: React.FC<MenuItemSelectorProps> = ({
  selectedItems,
  onItemsChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleAddItem = () => {
    if (inputText.trim() && !selectedItems.includes(inputText.trim())) {
      onItemsChange([...selectedItems, inputText.trim()]);
      setInputText("");
    }
  };

  const handleRemoveItem = (item: string) => {
    onItemsChange(selectedItems.filter((i) => i !== item));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.headerText}>What did you eat?</Text>
        <Icon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="#000"
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.content}>
          {/* TODO: Replace this temporary input with NetNutrition integration */}
          <Text style={styles.tempLabel}>Type dish names</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter dish name..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddItem}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddItem}
              disabled={!inputText.trim()}
            >
              <Icon
                name="plus"
                size={20}
                color={inputText.trim() ? "#007AFF" : "#ccc"}
              />
            </TouchableOpacity>
          </View>

          {/* Selected items list */}
          {selectedItems.map((item, index) => (
            <View key={index} style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>{item}</Text>
              <TouchableOpacity 
                testID={`remove-item-${index}`}
                onPress={() => handleRemoveItem(item)}
              >
                <Icon name="x" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  placeholder: {
    color: "#666",
    fontStyle: "italic",
  },
  tempLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    marginRight: 8,
    color: "#000",
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e8f4f8",
    padding: 8,
    marginBottom: 4,
    borderRadius: 6,
  },
  selectedItemText: {
    fontSize: 14,
    color: "#333",
  },
});

export default MenuItemSelector;
