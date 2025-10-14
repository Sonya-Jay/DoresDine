import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface NotesInputProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const NotesInput: React.FC<NotesInputProps> = ({ notes, onNotesChange }) => {
  // TODO: Implement actual text input functionality
  // This could open a modal with a TextInput, or navigate to a new screen
  const handlePress = () => {
    // For now, just a placeholder
    console.log('Open notes input');
    // You could use a modal here or navigate to a new screen
    // Example: navigation.navigate('NotesScreen', { notes, onSave: onNotesChange });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Text style={styles.text}>Add notes</Text>
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

export default NotesInput;
