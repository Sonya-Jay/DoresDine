import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, ScrollView, Alert, Text } from 'react-native';
import Header from './components/Header';
import PostCard from './components/PostCard';
import BottomNav from './components/BottomNav';
import CreatePostModal from './components/CreatePostModal';
import MenusScreen from './components/MenusScreen';
import styles from './styles';
import { Post, PostData, BackendPost } from './types';
import { API_URL } from '@env';

// Convert backend post format to frontend format for display
const convertBackendPostToFrontend = (backendPost: BackendPost): Post => {
  // Format the date in a readable way
  const postDate = new Date(backendPost.created_at);
  const formattedDate = postDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  // Use the actual meal type from the post, or fallback to time-based detection
  const mealTime =
    backendPost.meal_type ||
    (postDate.getHours() < 11
      ? 'Breakfast'
      : postDate.getHours() < 16
      ? 'Lunch'
      : 'Dinner');

  // Create a consistent post template
  return {
    id: backendPost.id,
    username: backendPost.username,
    dininghall: backendPost.dining_hall_name || 'Unknown Dining Hall',
    date: `${formattedDate} ${mealTime}`,
    visits: Math.floor(Math.random() * 50) + 1, // TODO: Implement real visit tracking
    images:
      backendPost.photos.length > 0
        ? backendPost.photos.map(photo => ({
            uri: photo.storage_key.startsWith('http')
              ? photo.storage_key
              : `${API_URL}/${photo.storage_key}`, // Serve uploaded files from backend
            rating: backendPost.rating || 7.5, // Use rating from post or default to 7.5
          }))
        : [], // No placeholder image when no photos - will show menu items instead
    notes: backendPost.caption || '',
    menuItems: backendPost.menu_items || [],
    rating: backendPost.rating || 7.5,
    likeCount: backendPost.like_count || 0,
    commentCount: backendPost.comment_count || 0,
    isLiked: backendPost.is_liked || false,
  };
};

const DoresDineApp: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Feed');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialDiningHall, setInitialDiningHall] = useState<string>('');
  const [initialMealType, setInitialMealType] = useState<string>('');

  // Fetch posts from backend
  const fetchPosts = async () => {
    const userId = '00000000-0000-0000-0000-000000000001'; // Use same hardcoded user ID

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts`, {
        headers: {
          'X-User-Id': userId,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const backendPosts: BackendPost[] = await response.json();
      const frontendPosts = backendPosts.map(convertBackendPostToFrontend);
      setPosts(frontendPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts');
      // Set empty array if fetch fails
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Debug: Log posts when they change
  useEffect(() => {
    console.log('Posts updated:', posts.length, 'posts');
    posts.forEach((post, index) => {
      console.log(`Post ${index + 1}:`, {
        id: post.id,
        username: post.username,
        images: post.images.length,
        notes: post.notes ? post.notes.substring(0, 50) + '...' : 'No notes',
      });
    });
  }, [posts]);

  const handleCreatePost = async (postData: PostData) => {
    // TODO: Replace hardcoded user ID with real authentication/user selection
    const userId = '00000000-0000-0000-0000-000000000001';

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          caption: postData.notes || '',
          rating: postData.rating,
          menu_items: postData.menuItems,
          dining_hall_name: postData.restaurantName,
          meal_type: postData.mealType,
          photos: postData.photos.map((photo, index) => ({
            storage_key: photo,
            display_order: index,
          })),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating post:', error);
        Alert.alert(
          'Error',
          `Error creating post: ${error.error || 'Unknown error'}`,
        );
      } else {
        const newPost = await response.json();
        console.log('Post created successfully:', newPost);
        Alert.alert('Success', 'Post created successfully!');
        // Refresh the posts list to show the new post
        fetchPosts();
      }
    } catch (error) {
      console.error('Network error creating post:', error);
      Alert.alert('Network Error', `Could not connect to server: ${error}`);
    }
    setModalVisible(false);
  };

  const handleLike = async (postId: number) => {
    const userId = '00000000-0000-0000-0000-000000000001';

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error liking post:', error);
        Alert.alert(
          'Error',
          `Error liking post: ${error.error || 'Unknown error'}`,
        );
        return;
      }

      // Refresh posts to get updated like counts
      fetchPosts();
    } catch (error) {
      console.error('Network error liking post:', error);
      Alert.alert('Network Error', `Could not connect to server: ${error}`);
    }
  };

  const handleCommentCountUpdate = (postId: number, newCount: number) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId ? { ...post, commentCount: newCount } : post,
      ),
    );
  };

  const handleCreateSimilarPost = (diningHall: string, mealType: string) => {
    setInitialDiningHall(diningHall);
    setInitialMealType(mealType);
    setModalVisible(true);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Feed':
        return (
          <>
            <Header
              searchText={searchText}
              setSearchText={setSearchText}
              onAddPress={() => {
                setInitialDiningHall('');
                setInitialMealType('');
                setModalVisible(true);
              }}
            />
            <ScrollView style={styles.feed}>
              {loading ? (
                <Text
                  style={{ padding: 20, fontSize: 16, textAlign: 'center' }}
                >
                  Loading posts...
                </Text>
              ) : posts.length > 0 ? (
                posts.map(p => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onLike={handleLike}
                    onCommentCountUpdate={handleCommentCountUpdate}
                    onCreateSimilarPost={handleCreateSimilarPost}
                  />
                ))
              ) : (
                <Text
                  style={{ padding: 20, fontSize: 16, textAlign: 'center' }}
                >
                  No posts yet. Be the first to share a meal!
                </Text>
              )}
            </ScrollView>
          </>
        );
      case 'Menus':
        return <MenusScreen />;
      case 'Search':
      case 'Friends':
      case 'Profile':
        return (
          <>
            <Header
              searchText={searchText}
              setSearchText={setSearchText}
              onAddPress={() => setModalVisible(true)}
            />
            <Text style={{ padding: 20, fontSize: 18, textAlign: 'center' }}>
              {activeTab} - Coming soon!
            </Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderScreen()}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePost}
        initialDiningHall={initialDiningHall}
        initialMealType={initialMealType}
      />
    </SafeAreaView>
  );
};

export default DoresDineApp;
