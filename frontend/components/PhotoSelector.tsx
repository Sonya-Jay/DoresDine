import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { API_URL } from '@env';

interface PhotoSelectorProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  onPhotosChange,
}) => {
  const handlePress = async () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1 },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Image picker error');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          if (!asset.uri) return;

          // Upload the photo to backend
          try {
            const formData = new FormData();
            formData.append('photo', {
              uri: asset.uri,
              name: asset.fileName || 'photo.jpg',
              type: asset.type || 'image/jpeg',
            } as any);

            const uploadRes = await fetch(`${API_URL}/upload/photo`, {
              method: 'POST',
              body: formData,
              headers: {
                Accept: 'application/json',
                // 'Content-Type' should NOT be set for FormData in React Native
              },
            });
            if (!uploadRes.ok) {
              Alert.alert('Upload failed', 'Could not upload photo');
              return;
            }
            const { storage_key } = await uploadRes.json();
            onPhotosChange([...photos, storage_key]);
          } catch (err) {
            Alert.alert('Upload error', 'Failed to upload photo');
          }
        }
      },
    );
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
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});

export default PhotoSelector;
