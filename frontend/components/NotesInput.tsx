import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  View,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface NotesInputProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({ notes, onNotesChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);

  const handlePress = () => {
    setTempNotes(notes);
    setModalVisible(true);
  };

  const handleSave = () => {
    onNotesChange(tempNotes);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempNotes(notes);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handlePress}>
        <Text style={styles.text}>
          {notes
            ? `Notes: ${notes.substring(0, 30)}${
                notes.length > 30 ? '...' : ''
              }`
            : 'Add notes'}
        </Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Notes</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              style={styles.textInput}
              value={tempNotes}
              onChangeText={setTempNotes}
              placeholder="Write about your meal experience..."
              multiline={true}
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={500}
              autoFocus={true}
            />

            <Text style={styles.characterCount}>
              {tempNotes.length}/500 characters
            </Text>
          </View>
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 8,
  },
});

export default NotesInput;
