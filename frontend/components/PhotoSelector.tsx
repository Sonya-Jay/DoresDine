import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Keep for now, will fix deprecation separately
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (!asset.uri) return;

      // Compress and resize image before uploading
      try {
        // Resize to max 1920px width/height and compress to reduce file size
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          asset.uri,
          [
            { resize: { width: 1920 } }, // Resize to max 1920px width (maintains aspect ratio)
          ],
          {
            compress: 0.7, // Compress to 70% quality (reduces file size significantly)
            format: ImageManipulator.SaveFormat.JPEG, // Use JPEG for better compression
          }
        );

        console.log("Image compressed:", {
          original: asset.uri,
          compressed: manipulatedImage.uri,
          width: manipulatedImage.width,
          height: manipulatedImage.height,
        });

        // Upload the compressed photo to backend
        const storageKey = await uploadPhoto(
          manipulatedImage.uri,
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
