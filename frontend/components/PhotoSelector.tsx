import { uploadPhoto, getPhotoUrl } from "@/services/api";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Feather";

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
      // Accept all image types
      const validAssets = result.assets.filter((asset) => {
        if (!asset.uri) return false;
        return true;
      });

      if (validAssets.length === 0) {
        Alert.alert("No valid images", "Please select valid images");
        return;
      }

      setIsUploading(true);
      
      // Process all valid images
      const uploadPromises = validAssets.map(async (asset) => {
        if (!asset.uri) return null;

        try {
          // Get original file extension to preserve format
          const originalFileName = asset.fileName || asset.uri;
          const fileExtension = originalFileName.toLowerCase().split('.').pop() || 'jpg';
          
          // Determine format based on original file
          let saveFormat = ImageManipulator.SaveFormat.JPEG;
          if (fileExtension === 'png') {
            saveFormat = ImageManipulator.SaveFormat.PNG;
          }
          
          // Compress and resize image before uploading (preserves original format)
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            asset.uri,
            [
              { resize: { width: 1920 } }, // Resize to max 1920px width (maintains aspect ratio)
            ],
            {
              compress: 0.6, // Compress to 60% quality (reduces file size more aggressively)
              format: saveFormat, // Preserve original format (JPEG or PNG)
            }
          );

          console.log("Image processed:", {
            original: asset.uri,
            processed: manipulatedImage.uri,
            width: manipulatedImage.width,
            height: manipulatedImage.height,
            format: saveFormat,
          });

          // Upload the processed photo to backend
          // Use the correct extension based on the processed format (not original)
          const processedExtension = saveFormat === ImageManipulator.SaveFormat.PNG ? 'png' : 'jpg';
          const fileName = asset.fileName 
            ? asset.fileName.replace(/\.(heic|heif|jpg|jpeg|png|gif|webp|bmp)$/i, `.${processedExtension}`)
            : `photo_${Date.now()}.${processedExtension}`;
          
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

  const handleDeletePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <View>
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
      
      {photos.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.photoList}
        >
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image 
                source={{ uri: getPhotoUrl(photo) }} 
                style={styles.photoThumbnail}
              />
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeletePhoto(index)}
              >
                <Icon name="x" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
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
  photoList: {
    marginBottom: 12,
  },
  photoContainer: {
    marginRight: 12,
    position: "relative",
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PhotoSelector;
