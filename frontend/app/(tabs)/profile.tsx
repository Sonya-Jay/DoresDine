import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { getCurrentUser, logout } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  const user = getCurrentUser();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (err: any) {
      console.error('Logout failed', err);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <Header searchText={searchText} setSearchText={setSearchText} />
        }
        data={[]}
        keyExtractor={(item) => String(item)}
        renderItem={() => null}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center", marginTop: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Profile' : 'Profile'}
            </Text>
            {user && (
              <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginBottom: 12 }}>
                {user.email}
              </Text>
            )}
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
              View and edit your profile - coming soon!
            </Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontWeight: '600' },
});

