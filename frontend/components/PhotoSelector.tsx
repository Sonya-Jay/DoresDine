import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { uploadPhoto } from "@/services/api";

interface PhotoSelectorProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  onPhotosChange,
}) => {
  const handlePress = async () => {
    // Request camera roll permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (!asset.uri) return;

      // Upload the photo to backend
      try {
        const storageKey = await uploadPhoto(
          asset.uri,
          asset.fileName || "photo.jpg"
        );
        onPhotosChange([...photos, storageKey]);
      } catch (err: any) {
        Alert.alert("Upload error", err.message || "Failed to upload photo");
        console.error(err);
      }
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Text style={styles.text}>
        Add photos {photos.length > 0 && `(${photos.length})`}
      </Text>
      <Icon name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: "#000",
  },
});

export default PhotoSelector;
