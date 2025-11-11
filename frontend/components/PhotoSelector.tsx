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
  const [isUploading, setIsUploading] = React.useState(false);

  const handlePress = async () => {
    if (isUploading) {
      Alert.alert("Upload in progress", "Please wait for current uploads to finish");
      return;
    }
    // Request camera roll permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true, // Enable multiple photo selection
      selectionLimit: 10, // Allow up to 10 photos
      quality: 0.8,
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      // Filter out HEIC/HEIF files - React Native Image doesn't support them
      const validAssets = result.assets.filter((asset) => {
        if (!asset.uri) return false;
        const fileName = asset.fileName || asset.uri;
        const extension = fileName.toLowerCase().split('.').pop();
        if (extension === 'heic' || extension === 'heif') {
          return false;
        }
        return true;
      });

      // Check if any HEIC files were filtered out
      const heicCount = result.assets.length - validAssets.length;
      if (heicCount > 0) {
        Alert.alert(
          "HEIC files not supported",
          `${heicCount} HEIC file${heicCount > 1 ? 's were' : ' was'} removed. Please select JPEG or PNG images instead.`
        );
      }

      if (validAssets.length === 0) {
        Alert.alert("No valid images", "Please select JPEG or PNG images (HEIC files are not supported)");
        return;
      }

      setIsUploading(true);
      
      // Process all valid images
      const uploadPromises = validAssets.map(async (asset) => {
        if (!asset.uri) return null;

        try {
          // Compress and resize image before uploading
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
          // Always use .jpg extension since we convert everything to JPEG
          const fileName = asset.fileName 
            ? asset.fileName.replace(/\.(heic|heif|png|gif)$/i, '.jpg')
            : `photo_${Date.now()}.jpg`;
          
          const storageKey = await uploadPhoto(
            manipulatedImage.uri,
            fileName
          );
          return storageKey;
        } catch (err: any) {
          console.error("Error uploading photo:", err);
          Alert.alert("Upload error", `Failed to upload ${asset.fileName || "photo"}: ${err.message || "Unknown error"}`);
          return null;
        }
      });

      // Wait for all uploads to complete
      try {
        const storageKeys = await Promise.all(uploadPromises);
        const successfulUploads = storageKeys.filter((key) => key !== null) as string[];
        
        if (successfulUploads.length > 0) {
          onPhotosChange([...photos, ...successfulUploads]);
          if (successfulUploads.length < validAssets.length) {
            Alert.alert(
              "Partial upload", 
              `Uploaded ${successfulUploads.length} of ${validAssets.length} photos`
            );
          }
        } else {
          Alert.alert("Upload failed", "Failed to upload any photos");
        }
      } catch (error) {
        console.error("Error uploading photos:", error);
        Alert.alert("Upload error", "Failed to upload photos");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isUploading && styles.containerDisabled]} 
      onPress={handlePress}
      disabled={isUploading}
    >
      <Text style={styles.text}>
        {isUploading ? "Uploading..." : `Add photos ${photos.length > 0 ? `(${photos.length})` : ""}`}
      </Text>
      {!isUploading && <Icon name="chevron-right" size={20} color="#666" />}
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
  containerDisabled: {
    opacity: 0.5,
  },
});

export default PhotoSelector;
