// ScheduleDetails.tsx (replace your current file)
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles';
import { api } from './api/client';
import {
  DiningHall,
  DayMenu,
  MealPeriod,
  MenuItem,
} from '../../backend/src/types/dining';
// import MealItems from './MealItems';

interface Props {
  hall: DiningHall;
  unitId: number;
  onBack: () => void;
}

const ScheduleDetailScreen: React.FC<Props> = ({ hall, onBack }) => {
  const [searchText, setSearchText] = useState<string>('');
  const [schedule, setSchedule] = useState<DayMenu[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMenuId, setExpandedMenuId] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [errorItems, setErrorItems] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getHallMenu(hall.id)
      .then(res => {
        if (!mounted) return;
        setSchedule(res.schedule || []);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.message || 'Failed to load schedule');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [hall]);

  // const toggleExpand = (menuId: number) => {
  //   setExpandedMenuIds((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  // };
  const handleMealPress = async (meal: MealPeriod) => {
    if (expandedMenuId === meal.id) {
      // Collapse if already expanded
      setExpandedMenuId(null);
      return;
    }

    setExpandedMenuId(meal.id);
    setLoadingItems(true);
    setErrorItems(null);
    setMenuItems([]);

    try {
      const items = await api.getMenuItems(meal.id, hall.id); // hall.id = unitId
      setMenuItems(items);
    } catch (err: any) {
      setErrorItems(err.message || 'Failed to fetch menu items');
    } finally {
      setLoadingItems(false);
    }
  };

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
            placeholder="Search a menu, member, etc."
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

      {/* Dining Hall Header with Back Button */}
      <View style={styles.diningHallHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.diningHallTitle}>{hall.name}</Text>
      </View>

      {/* Menu List */}
      <ScrollView style={styles.menuList}>
        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
        {error && <Text style={{ color: 'red', padding: 12 }}>{error}</Text>}

        {!loading && !error && schedule && schedule.length === 0 && (
          <Text style={{ padding: 12 }}>No schedule available.</Text>
        )}

        {!loading &&
          !error &&
          schedule?.map(day => (
            <View key={day.date} style={styles.daySection}>
              <Text style={styles.dayHeader}>{day.date}</Text>

              {day.meals.map((meal: MealPeriod) => (
                <View key={meal.id}>
                  <TouchableOpacity
                    style={styles.mealButton}
                    activeOpacity={0.7}
                    onPress={() => handleMealPress(meal)}
                  >
                    <Text style={styles.mealText}>{meal.name}</Text>
                  </TouchableOpacity>

                  {expandedMenuId === meal.id && (
                    <View style={{ padding: 12, backgroundColor: '#f2f2f2' }}>
                      {loadingItems && <ActivityIndicator />}
                      {errorItems && (
                        <Text style={{ color: 'red' }}>{errorItems}</Text>
                      )}
                      {!loadingItems &&
                        !errorItems &&
                        menuItems.length === 0 && (
                          <Text>No items available.</Text>
                        )}
                      {!loadingItems &&
                        !errorItems &&
                        menuItems.map((item, index) => (
                          <Text key={index}>
                            {item.name}{' '}
                            {item.allergens?.length
                              ? `(${item.allergens.join(', ')})`
                              : ''}
                          </Text>
                        ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleDetailScreen;
