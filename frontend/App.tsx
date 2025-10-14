import React, { useState } from 'react';
import { SafeAreaView, StatusBar, ScrollView } from 'react-native';
import Header from './components/Header';
import PostCard from './components/PostCard';
import BottomNav from './components/BottomNav';
import CreatePostModal from './components/CreatePostModal.tsx';
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
    const userId = '1'; // <-- Hardcoded for now
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          caption: postData.notes || '',
          // TODO: Map postData.photos if you add photo upload
          photos: postData.photos || [],
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating post:', error);
        // Optionally show error to user
      } else {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // Optionally show error to user
    }
    setModalVisible(false);
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
        onAddPress={() => setModalVisible(true)}
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
