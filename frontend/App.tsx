import React, { useState } from 'react';
import { SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import Header from './components/Header';
import PostCard from './components/PostCard';
import BottomNav from './components/BottomNav';
import CreatePostModal from './components/CreatePostModal';
import styles from './styles';
import { Post, PostData } from './types';
import { API_URL } from '@env';

const samplePosts: Post[] = [
  {
    id: 1,
    username: 'VandyDiner123',
    dininghall: 'Rand Dining Center',
    date: '09/19/2025 Lunch',
    visits: 23,
    images: [
      {
        uri: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400',
        rating: 5.8,
      },
      {
        uri: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
        rating: 10.0,
      },
    ],
    notes: 'Love rand cookies',
  },
  {
    id: 2,
    username: 'DiningHater01',
    dininghall: 'The Kitchen at Kissam',
    date: '09/19/2025 Lunch',
    visits: 11,
    images: [
      {
        uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        rating: 1.2,
      },
    ],
    notes: '',
  },
];

const DoresDineApp: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Feed');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>(samplePosts);

  const handleCreatePost = async (postData: PostData) => {
    // TODO: Replace hardcoded user ID with real authentication/user selection
    // For now, we'll create a test user or use an existing one
    const userId = await getOrCreateTestUser();

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          caption: postData.notes || '',
          photos: postData.photos.map((photo, index) => ({
            storage_key: photo,
            display_order: index,
          })),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating post:', error);
        Alert.alert('Error', `Error creating post: ${error.error || 'Unknown error'}`);
      } else {
        const newPost = await response.json();
        console.log('Post created successfully:', newPost);
        // TODO: Convert backend post format to frontend Post format
        Alert.alert('Success', 'Post created successfully!');
      }
    } catch (error) {
      console.error('Network error creating post:', error);
      Alert.alert('Network Error', `Could not connect to server: ${error}`);
    }
    setModalVisible(false);
  };

  // Helper function to get or create a test user
  const getOrCreateTestUser = async (): Promise<string> => {
    const testUsername = 'testuser';
    const testEmail = 'testuser@example.com';

    try {
      // First, try to get existing user
      const getResponse = await fetch(`${API_URL}/users/username/${testUsername}`);

      if (getResponse.ok) {
        const user = await getResponse.json();
        console.log('Using existing test user:', user.id);
        return user.id;
      }

      // If user doesn't exist (404), create it
      if (getResponse.status === 404) {
        const createResponse = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: testUsername,
            email: testEmail,
          }),
        });

        if (createResponse.ok) {
          const user = await createResponse.json();
          console.log('Created new test user:', user.id);
          return user.id;
        }

        throw new Error('Failed to create test user');
      }

      throw new Error('Failed to fetch user');
    } catch (error) {
      console.error('Error getting/creating test user:', error);
      throw error; // Re-throw so the post creation fails with a proper error message
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header
        searchText={searchText}
        setSearchText={setSearchText}
        onAddPress={() => setModalVisible(true)}
      />

      <ScrollView style={styles.feed}>
        {posts.map(p => (
          <PostCard key={p.id} post={p} />
        ))}
      </ScrollView>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePost}
      />
    </SafeAreaView>
  );
};

export default DoresDineApp;
