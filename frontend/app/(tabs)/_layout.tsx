import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' }, // Hide default tab bar, using BottomNav instead
        headerShown: false, // Hide header, using Header component instead
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
        }}
      />
      <Tabs.Screen
        name="menus"
        options={{
          title: 'Menus',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          title: 'Create Post',
        }}
      />
      <Tabs.Screen
        name="schedule-details"
        options={{
          title: 'Menu Schedule',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="menu-items"
        options={{
          title: 'Menu Items',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="user-profile"
        options={{
          title: 'User Profile',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="dish-results"
        options={{
          title: 'Dish Results',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="dining-hall-profile"
        options={{
          title: 'Dining Hall Profile',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
