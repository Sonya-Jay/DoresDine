import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import ScheduleDetailScreen from './ScheduleDetails';
// import Header from './components/Header';
import styles from '../styles';
import Icon from 'react-native-vector-icons/Ionicons';

interface DiningFacility {
  id: number;
  name: string;
  isOpen: boolean;
}

const diningFacilities: DiningFacility[] = [
  { id: 1, name: 'Rand Dining Center', isOpen: true },
  { id: 2, name: 'The Commons Dining Center', isOpen: true },
  { id: 3, name: 'The Kitchen at Kissam', isOpen: true },
  { id: 4, name: 'E. Bronson Ingram Dining Center', isOpen: false },
  { id: 5, name: 'Rothschild Dining Center', isOpen: true },
  { id: 6, name: 'Café Carmichael', isOpen: false },
  { id: 7, name: 'The Pub at Overcup Oak', isOpen: true },
  { id: 8, name: 'Zeppos Dining', isOpen: true },
  { id: 9, name: 'Local Java Café at Alumni', isOpen: true },
  { id: 10, name: 'Vandy Blenz', isOpen: false },
  { id: 11, name: 'Wasabi', isOpen: true },
  { id: 12, name: 'Grins Vegetarian Cafe', isOpen: false },
  { id: 13, name: 'Holy Smokes Kosher Food Truck', isOpen: true },
];

const MenusScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  // const [activeTab, setActiveTab] = useState<string>('Menus');
  const [selectedHall, setSelectedHall] = useState<string | null>(null);

  const filteredFacilities = diningFacilities.filter(facility =>
    facility.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  if (selectedHall) {
    return (
      <ScheduleDetailScreen
        hallName={selectedHall}
        onBack={() => setSelectedHall(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>
            Dores<Text style={styles.logoAccent}>Dine</Text>
          </Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Icon name="notifications-outline" size={28} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="menu" size={32} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a Dining Hall"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dining Facilities List */}
      <ScrollView style={styles.feed}>
        <View style={styles.menusContainer}>
          <Text style={styles.sectionTitle}>Dining Facilities</Text>

          {filteredFacilities.map(facility => (
            <TouchableOpacity
              key={facility.id}
              style={styles.facilityCard}
              activeOpacity={0.7}
              onPress={() => setSelectedHall(facility.name)}
            >
              <Text style={styles.facilityName}>{facility.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  facility.isOpen ? styles.statusOpen : styles.statusClosed,
                ]}
              >
                <Text style={styles.statusText}>
                  {facility.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MenusScreen;
