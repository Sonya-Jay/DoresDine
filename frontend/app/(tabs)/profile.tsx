import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { fetchMyPosts, toggleLikePost } from "@/services/api";
import { Post } from "@/types";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyPosts();
      setPosts(data);
    } catch (err: any) {
      console.error('Failed to load my posts', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadPosts();
      hasLoadedRef.current = true;
    }
  }, []);

  // Refresh posts when screen comes into focus (but not on initial load)
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        loadPosts();
      }
    }, [])
  );

  const handleLike = async (postId: number | string) => {
    try {
      // Optimistic UI update
      setPosts((prev) =>
        prev.map((p) => {
          if (String(p.id) === String(postId)) {
            const liked = !p.isLiked;
            return {
              ...p,
              isLiked: liked,
              likeCount: liked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1),
            } as Post;
          }
          return p;
        })
      );

      await toggleLikePost(postId);
    } catch (err) {
      console.error('Error toggling like on profile:', err);
      // Re-fetch to correct state
      loadPosts();
    }
  };

  const handleCommentCountUpdate = (postId: number | string, newCount: number) => {
    setPosts((prev) => prev.map((p) => (String(p.id) === String(postId) ? { ...p, commentCount: newCount } : p)));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingBottom: 80, // Space for bottom nav
        }}
        ListHeaderComponent={<Header searchText={searchText} setSearchText={setSearchText} />}
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard post={item} onLike={handleLike} onCommentCountUpdate={handleCommentCountUpdate} />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ padding: 20, alignItems: "center", marginTop: 40 }}>
              <ActivityIndicator size="large" color="#D4A574" />
            </View>
          ) : error ? (
            <View style={{ padding: 20, alignItems: "center", marginTop: 40 }}>
              <Text style={{ color: "#c00" }}>{error}</Text>
            </View>
          ) : (
            <View style={{ padding: 20, alignItems: "center", marginTop: 40 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>No Posts Yet</Text>
              <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>You haven't posted anything yet.</Text>
            </View>
          )
        }
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await loadPosts();
          setRefreshing(false);
        }}
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

