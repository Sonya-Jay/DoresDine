import React from 'react';
import { Tabs } from 'expo-router';

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
          presentation: 'modal',
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
    </Tabs>
  );
}
