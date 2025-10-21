// import React, { useState } from 'react';
// import {
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import styles from '../styles';

// interface MealPeriod {
//   name: string;
//   available: boolean;
// }

// interface DayMenu {
//   date: string;
//   meals: MealPeriod[];
// }

// interface ScheduleDetailProps {
//   hallName: string;
//   onBack: () => void;
// }

// const ScheduleDetailScreen: React.FC<ScheduleDetailProps> = ({
//   hallName,
//   onBack,
// }) => {
//   const [searchText, setSearchText] = useState<string>('');

//   // Sample data - will be replaced with API call later
//   const menuData: DayMenu[] = [
//     {
//       date: 'Wednesday, September 24, 2025',
//       meals: [
//         { name: 'Breakfast', available: true },
//         { name: 'Lunch', available: true },
//       ],
//     },
//     {
//       date: 'Thursday, September 25, 2025',
//       meals: [
//         { name: 'Breakfast', available: true },
//         { name: 'Lunch', available: true },
//       ],
//     },
//     {
//       date: 'Friday, September 26, 2025',
//       meals: [
//         { name: 'Breakfast', available: true },
//         { name: 'Lunch', available: true },
//         { name: 'Dinner', available: true },
//       ],
//     },
//     {
//       date: 'Saturday, September 27, 2025',
//       meals: [
//         { name: 'Breakfast', available: true },
//         { name: 'Lunch', available: true },
//         { name: 'Dinner', available: true },
//       ],
//     },
//     {
//       date: 'Sunday, September 28, 2025',
//       meals: [
//         { name: 'Breakfast', available: true },
//         { name: 'Lunch', available: true },
//       ],
//     },
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerTop}>
//           <Text style={styles.logo}>
//             Dores<Text style={styles.logoAccent}>Dine</Text>
//           </Text>
//           <View style={styles.headerIcons}>
//             <TouchableOpacity style={{ marginRight: 16 }}>
//               <Icon name="notifications-outline" size={28} color="#000" />
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <Icon name="menu" size={32} color="#000" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.searchBar}>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search a menu, member, etc."
//             placeholderTextColor="#999"
//             value={searchText}
//             onChangeText={setSearchText}
//           />
//           {searchText.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchText('')}>
//               <Icon name="close" size={20} color="#666" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Dining Hall Header with Back Button */}
//       <View style={styles.diningHallHeader}>
//         <TouchableOpacity onPress={onBack} style={styles.backButton}>
//           <Icon name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.diningHallTitle}>{hallName}</Text>
//       </View>

//       {/* Menu List */}
//       <ScrollView style={styles.menuList}>
//         {menuData.map((day, dayIndex) => (
//           <View key={dayIndex} style={styles.daySection}>
//             <Text style={styles.dayHeader}>{day.date}</Text>
//             {day.meals.map((meal, mealIndex) => (
//               <TouchableOpacity
//                 key={mealIndex}
//                 style={styles.mealButton}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.mealText}>{meal.name}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         ))}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ScheduleDetailScreen;
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
import { DiningHall, DayMenu, MealPeriod } from '../../backend/src/types/dining';
import MealItems from './MealItems';

interface Props {
  hall: DiningHall;
  onBack: () => void;
}

const ScheduleDetailScreen: React.FC<Props> = ({ hall, onBack }) => {
  const [searchText, setSearchText] = useState<string>('');
  const [schedule, setSchedule] = useState<DayMenu[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMenuIds, setExpandedMenuIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getHallMenu(hall.id)
      .then((res) => {
        if (!mounted) return;
        setSchedule(res.schedule || []);
      })
      .catch((err) => {
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

  const toggleExpand = (menuId: number) => {
    setExpandedMenuIds((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
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
          schedule?.map((day) => (
            <View key={day.date} style={styles.daySection}>
              <Text style={styles.dayHeader}>{day.date}</Text>

              {day.meals.map((meal: MealPeriod) => (
                <View key={String(meal.id)}>
                  <TouchableOpacity
                    style={styles.mealButton}
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(meal.id)}
                  >
                    <Text style={styles.mealText}>{meal.name}</Text>
                  </TouchableOpacity>

                  {expandedMenuIds[meal.id] && (
                    <View style={{ paddingLeft: 12 }}>
                      <MealItems menuId={meal.id} />
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
