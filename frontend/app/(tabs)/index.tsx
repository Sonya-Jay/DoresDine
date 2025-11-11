import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { fetchPosts, getOrCreateUser, toggleLikePost } from "@/services/api";
import { Post } from "@/types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        await getOrCreateUser();
      } catch (err) {
        console.error("Error initializing user:", err);
      }
    };
    initUser();
  }, []);

  const loadPosts = async () => {
    try {
      setError(null);
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId: number | string) => {
    try {
      await toggleLikePost(postId);
      // Update local state optimistically
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
      // You could show an error message to the user here
    }
  };

  const handleCommentCountUpdate = (postId: number | string, newCount: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, commentCount: newCount } : post
      )
    );
  };

  const handleCreateSimilarPost = (diningHall: string, mealType: string) => {
    // TODO: Navigate to create post with pre-filled data
    console.log("Create similar post:", diningHall, mealType);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
        <TouchableOpacity
          onPress={loadPosts}
          style={{
            backgroundColor: '#007AFF',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingBottom: 80, // Space for bottom nav
        }}
        ListHeaderComponent={
          <Header searchText={searchText} setSearchText={setSearchText} />
        }
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onCommentCountUpdate={handleCommentCountUpdate}
            onCreateSimilarPost={handleCreateSimilarPost}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center', minHeight: 200 }}>
            <Text style={{ color: '#666', fontSize: 16 }}>No posts yet</Text>
            <Text style={{ color: '#999', fontSize: 14, marginTop: 5 }}>
              Be the first to share a dining experience!
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      }}>
        <BottomNav />
      </View>
    </View>
  );
}
