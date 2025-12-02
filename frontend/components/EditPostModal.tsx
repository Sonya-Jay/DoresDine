import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Slider from "@react-native-community/slider";

interface EditPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updates: { caption?: string; rating?: number; menu_items?: string[] }) => Promise<void>;
  initialCaption: string;
  initialRating: number;
  initialMenuItems: string[];
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  onClose,
  onSave,
  initialCaption,
  initialRating,
  initialMenuItems,
}) => {
  const [caption, setCaption] = useState(initialCaption);
  const [rating, setRating] = useState(initialRating);
  const [menuItems, setMenuItems] = useState(initialMenuItems.join(", "));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: any = {};
      
      if (caption !== initialCaption) {
        updates.caption = caption;
      }
      
      if (rating !== initialRating) {
        updates.rating = rating;
      }
      
      const menuItemsArray = menuItems.split(",").map(item => item.trim()).filter(item => item);
      if (JSON.stringify(menuItemsArray) !== JSON.stringify(initialMenuItems)) {
        updates.menu_items = menuItemsArray;
      }

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Post</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Icon name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Rating Slider */}
            <View style={styles.section}>
              <Text style={styles.label}>Overall Rating</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10}
                  step={0.1}
                  value={rating}
                  onValueChange={setRating}
                  minimumTrackTintColor="#D4A574"
                  maximumTrackTintColor="#E0E0E0"
                  thumbTintColor="#D4A574"
                />
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.section}>
              <Text style={styles.label}>Menu Items (comma separated)</Text>
              <TextInput
                style={styles.textInput}
                value={menuItems}
                onChangeText={setMenuItems}
                placeholder="e.g., Burger, Fries, Salad"
                placeholderTextColor="#999"
                multiline
              />
            </View>

            {/* Caption/Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={caption}
                onChangeText={setCaption}
                placeholder="Add your thoughts about this meal..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#D4A574",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#000",
    backgroundColor: "#F9FAFB",
  },
  notesInput: {
    minHeight: 100,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  saveButton: {
    backgroundColor: "#D4A574",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default EditPostModal;
