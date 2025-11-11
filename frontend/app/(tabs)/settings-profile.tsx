import { getCurrentUser, getMe, logout, updateProfile } from '@/services/api';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function SettingsProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Open modal for editing a field
  const openEditModal = (field: string, value: string) => {
    if (field === 'Profile Photo') {
      handleEditPhoto();
      return;
    }
    setEditField(field);
    setEditValue(value);
    setModalVisible(true);
  };

  // Handle profile photo edit
  const handleEditPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need camera roll permissions");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    try {
      // Use uploadPhoto from services/api.ts
      const { uploadPhoto } = await import("@/services/api");
      const fileName = asset.fileName || `profile_${Date.now()}.jpg`;
      const storageKey = await uploadPhoto(asset.uri, fileName);
      await updateProfile({ profile_photo: storageKey });
      const updatedUser = await getMe();
      setUser(updatedUser);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to upload photo");
    }
  };

  // Dropdown options for preference fields
  const dropdownOptions: Record<string, string[]> = {
    'Notifications': ['enabled', 'disabled', 'silent'],
    'Language': ['English', 'Spanish', 'French', 'German', 'Chinese'],
    'Time Zone': ['UTC', 'EST', 'CST', 'MST', 'PST', 'Local'],
    'Privacy': ['Public', 'Private', 'Friends Only'],
    'Theme': ['Light', 'Dark', 'System'],
  };

  // Map field names to backend keys
  const fieldMap: Record<string, string> = {
    'Username': 'username',
    'Bio': 'bio',
    'Gender': 'gender',
    'Birthday': 'birthday',
    'Email': 'email',
    'Phone': 'phone',
    'Notifications': 'notification_pref',
    'Language': 'language',
    'Time Zone': 'timezone',
    'Privacy': 'privacy',
    'Theme': 'theme',
    'Profile Photo': 'profile_photo',
    'Password': 'password',
  };

  // Save changes and update profile
  const saveEdit = async () => {
    if (!editField) return;
    setLoading(true);
    try {
      const key = fieldMap[editField] || editField.toLowerCase();
      const updates: any = {};
      if (editField === 'Name') {
        // Split name into first_name and last_name
        const [first_name, ...rest] = editValue.split(' ');
        updates.first_name = first_name;
        updates.last_name = rest.join(' ');
      } else {
        updates[key] = editValue;
      }
      await updateProfile(updates);
      // Refresh user data
      const updatedUser = await getMe();
      setUser(updatedUser);
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Update auth state immediately
      if ((global as any).setAuthState) {
        (global as any).setAuthState(false);
      }
      // Replace navigation stack with login (prevents going back)
      router.replace('/login');
    } catch (err: any) {
      console.error('Logout failed', err);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 12 }}>Edit {editField}</Text>
            
            {editField && dropdownOptions[editField] ? (
              <View style={{ width: '100%' }}>
                {dropdownOptions[editField].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.dropdownOption, editValue === option && styles.dropdownOptionSelected]}
                    onPress={() => setEditValue(option)}
                  >
                    <Text style={[styles.dropdownOptionText, editValue === option && styles.dropdownOptionTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Enter new ${editField}`}
                autoFocus
                editable={!loading}
              />
            )}
            
            <View style={{ flexDirection: 'row', marginTop: 18 }}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit} disabled={loading}>
                <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)} disabled={loading}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Icon name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={[]}
        keyExtractor={(item) => String(item)}
        renderItem={() => null}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center", marginTop: 20 }}>
            {/* Profile Photo */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              {user?.profile_photo ? (
                <Image
                  source={{ uri: user.profile_photo }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={[styles.profilePhoto, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}> 
                  <Icon name="camera" size={40} color="#aaa" />
                </View>
              )}
              <TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Profile Photo', user?.profile_photo || '')}>
                <Text style={styles.editButtonText}>Edit Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Basic Info */}
            <Text style={styles.sectionTitle}>Basic Personal Info</Text>
            <View style={styles.infoRow}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Name', `${user?.first_name || ''} ${user?.last_name || ''}`.trim())}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Username:</Text><Text style={styles.value}>{user?.username || ''}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Username', user?.username || '')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Bio:</Text><Text style={styles.value}>{user?.bio || ''}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Bio', user?.bio || '')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Gender:</Text><Text style={styles.value}>{user?.gender || '—'}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Gender', user?.gender || '')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Birthday:</Text><Text style={styles.value}>{user?.birthday || '—'}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Birthday', user?.birthday || '')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>

            {/* Contact Info */}
            <Text style={styles.sectionTitle}>Contact Info</Text>
            <View style={styles.infoRow}><Text style={styles.label}>Email:</Text><Text style={styles.value}>{user?.email || ''}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Email', user?.email || '')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Phone:</Text><Text style={styles.value}>{user?.phone || '—'}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Phone', user?.phone || '')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>

            {/* Preferences */}
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.infoRow}><Text style={styles.label}>Notifications:</Text><Text style={styles.value}>{user?.notification_pref || 'Default'}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Notifications', user?.notification_pref || '')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Language:</Text><Text style={styles.value}>{user?.language || 'English'}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Language', user?.language || 'English')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Time Zone:</Text><Text style={styles.value}>{user?.timezone || 'Local'}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Time Zone', user?.timezone || 'Local')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Privacy:</Text><Text style={styles.value}>{user?.privacy || 'Public'}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Privacy', user?.privacy || 'Public')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>
            <View style={styles.infoRow}><Text style={styles.label}>Theme:</Text><Text style={styles.value}>{user?.theme || 'Light'}</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Theme', user?.theme || 'Light')}><Text style={styles.editButtonText}>Edit</Text></TouchableOpacity></View>

            {/* Password */}
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.infoRow}><Text style={styles.label}>Password:</Text><Text style={styles.value}>••••••••</Text><TouchableOpacity style={styles.editButton} onPress={() => openEditModal('Password', '')}><Text style={styles.editButtonText}>Change</Text></TouchableOpacity></View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  editButton: {
    marginLeft: 8,
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    justifyContent: 'flex-start',
  },
  label: {
    fontWeight: '600',
    width: 110,
    fontSize: 15,
    color: '#333',
  },
  value: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontWeight: '600' },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  dropdownOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dropdownOptionText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
