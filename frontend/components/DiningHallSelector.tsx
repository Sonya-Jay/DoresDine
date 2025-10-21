import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { DiningHall } from '../types';

interface DiningHallSelectorProps {
  diningHalls: DiningHall[];
  selectedDiningHall: DiningHall | null;
  onSelect: (diningHall: DiningHall) => void;
  placeholder?: string;
}

const DiningHallSelector: React.FC<DiningHallSelectorProps> = ({
  diningHalls,
  selectedDiningHall,
  onSelect,
  placeholder = 'Select a dining hall',
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (diningHall: DiningHall) => {
    onSelect(diningHall);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedDiningHall && styles.placeholder,
          ]}
        >
          {selectedDiningHall?.name || placeholder}
        </Text>
        <Icon name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Dining Hall</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsList}>
            {diningHalls.map(diningHall => (
              <TouchableOpacity
                key={diningHall.id}
                style={[
                  styles.option,
                  selectedDiningHall?.id === diningHall.id &&
                    styles.selectedOption,
                ]}
                onPress={() => handleSelect(diningHall)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedDiningHall?.id === diningHall.id &&
                      styles.selectedOptionText,
                  ]}
                >
                  {diningHall.name}
                </Text>
                {selectedDiningHall?.id === diningHall.id && (
                  <Icon name="check" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectorText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  optionsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default DiningHallSelector;
