import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface MenuItemSelectorProps {
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
}

const MenuItemSelector: React.FC<MenuItemSelectorProps> = ({
  selectedItems,
  onItemsChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.headerText}>What did you eat?</Text>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#000"
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.content}>
          <Text style={styles.placeholder}>Menu items would go here</Text>
          {/* TODO: Add actual menu item selection UI */}
          {/* This could be a searchable list, checkboxes, etc. */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  placeholder: {
    color: '#666',
    fontSize: 14,
  },
});

export default MenuItemSelector;
