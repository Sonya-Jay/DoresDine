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

  // Calculate header height: safe area + headerTop (40) + margins (12) + searchBar (24+12) + filter (16+3) + paddingBottom (12)
  const headerHeight = Math.max(insets.top, 15) + 40 + 12 + 24 + 12 + 16 + 3 + 12; // ~134px + safe area
  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fixed Header */}
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}>
        <Header searchText={searchText} setSearchText={setSearchText} />
      </View>
      
      {/* Scrollable Content */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingTop: headerHeight,
          paddingBottom: bottomNavHeight,
        }}
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
      
      {/* Fixed Bottom Nav */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      }}>
        <BottomNav />
      </View>
    </View>
  );
}

