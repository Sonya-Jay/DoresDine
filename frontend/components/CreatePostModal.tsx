import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MenuItemSelector from './MenuItemSelector';
import RatingSlider from './RatingSlider';
import CompanionSelector from './CompanionSelector';
import NotesInput from './NotesInput';
import PhotoSelector from './PhotoSelector';
import { PostData } from '../types';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: PostData) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [restaurant] = useState({ id: '1', name: 'Rand Dining Center' });
  const [mealType] = useState('Lunch');
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5.0);
  const [companions, setCompanions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleClose = () => {
    // Reset all form fields when closing
    setRating(5.0);
    setMenuItems([]);
    setCompanions([]);
    setNotes('');
    setPhotos([]);
    onClose();
  };

  const handleSubmit = () => {
    const postData: PostData = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      date: new Date().toLocaleDateString(),
      mealType,
      menuItems,
      rating,
      companions,
      notes,
      photos,
    };
    onSubmit(postData);
    handleClose(); // This will reset the form and close
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
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
            })}{' '}
            | {mealType}
          </Text>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Menu Item Selector */}
            <MenuItemSelector
              selectedItems={menuItems}
              onItemsChange={setMenuItems}
            />

            {/* Rating Slider */}
            <RatingSlider value={rating} onValueChange={setRating} />

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
          <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  postButton: {
    backgroundColor: '#D4A574',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ratingContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default CreatePostModal;
