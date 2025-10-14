import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import styles from '../styles';

interface NavItem {
  icon: string;
  label: string;
}

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (s: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items: NavItem[] = [
    { icon: 'grid', label: 'Feed' },
    { icon: 'file-text', label: 'Menus' },
    { icon: 'search', label: 'Search' },
    { icon: 'users', label: 'Friends' },
    { icon: 'user', label: 'Profile' },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item, idx) => {
        const isActive = activeTab === item.label;
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => setActiveTab(item.label)}
            style={styles.navItem}
          >
            <Icon
              name={item.icon}
              size={26}
              color={isActive ? '#000' : '#999'}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;
