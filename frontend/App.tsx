import React, { useState } from 'react';
import { SafeAreaView, StatusBar, ScrollView } from 'react-native';
import Header from './components/header';
import PostCard from './components/PostCard';
import BottomNav from './components/BottomNav';
import styles from './styles';
import { Post } from './types';

const samplePosts: Post[] = [
  {
    id: 1,
    username: 'VandyDiner123',
    restaurant: 'Rand Dining Center',
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
    restaurant: 'The Kitchen at Kissam',
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header searchText={searchText} setSearchText={setSearchText} />

      <ScrollView style={styles.feed}>
        {samplePosts.map(p => (
          <PostCard key={p.id} post={p} />
        ))}
      </ScrollView>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
};

export default DoresDineApp;
