import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import {
  fetchFriendPosts,
  fetchPosts,
  getOrCreateUser,
  toggleLikePost,
} from "@/services/api";
import { Post } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [headerHeight, setHeaderHeight] = useState(180);
  const [showFriendRecs, setShowFriendRecs] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "rating-high" | "rating-low" | "likes-high" | "likes-low">("newest");

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
      const fetchedPosts = showFriendRecs
        ? await fetchFriendPosts()
        : await fetchPosts();
      setPosts(fetchedPosts);
      hasLoadedRef.current = true;
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
  }, [showFriendRecs]);

  // Refresh posts when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      // Only refresh if we've already done the initial load
      if (hasLoadedRef.current && !loading) {
        loadPosts();
      }
    }, [loading])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleLike = async (postId: number | string) => {
    try {
      await toggleLikePost(postId);
      // Update local state optimistically - ensure we're working with numbers
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked
                  ? Math.max(0, (Number(post.likeCount) || 0) - 1)
                  : (Number(post.likeCount) || 0) + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
      // You could show an error message to the user here
    }
  };

  const handleCommentCountUpdate = (
    postId: number | string,
    newCount: number
  ) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, commentCount: newCount } : post
      )
    );
  };

  const handlePostFlagged = (postId: number | string) => {
    // Remove the flagged post from the feed
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  const handleCreateSimilarPost = (diningHall: string, mealType: string) => {
    console.log("Create similar post:", diningHall, mealType);
    router.push({
      pathname: "/(tabs)/create-post",
      params: { diningHall, mealType },
    } as any);
  };

  // Sort posts based on selected sort option
  const sortedPosts = useMemo(() => {
    const postsCopy = [...posts];
    
    switch (sortBy) {
      case "newest":
        return postsCopy.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA; // Newest first (descending)
        });
      case "rating-high":
        return postsCopy.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA; // High to low
        });
      case "rating-low":
        return postsCopy.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingA - ratingB; // Low to high
        });
      case "likes-high":
        return postsCopy.sort((a, b) => {
          const likesA = Number(a.likeCount) || 0;
          const likesB = Number(b.likeCount) || 0;
          return likesB - likesA; // Most likes first (descending)
        });
      case "likes-low":
        return postsCopy.sort((a, b) => {
          const likesA = Number(a.likeCount) || 0;
          const likesB = Number(b.likeCount) || 0;
          return likesA - likesB; // Least likes first (ascending)
        });
      default:
        return postsCopy;
    }
  }, [posts, sortBy]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        <TouchableOpacity
          onPress={loadPosts}
          style={{
            backgroundColor: "#007AFF",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Fixed Header */}
      <View
        onLayout={handleHeaderLayout}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Header
          searchText={searchText}
          setSearchText={setSearchText}
          onFriendRecsPress={() => setShowFriendRecs(!showFriendRecs)}
          activeFriendRecs={showFriendRecs}
          hideSearch={true}
          showSortButton={true}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </View>

      {/* Scrollable Content */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: bottomNavHeight,
        }}
        data={sortedPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onCommentCountUpdate={handleCommentCountUpdate}
            onCreateSimilarPost={handleCreateSimilarPost}
            onPostFlagged={handlePostFlagged}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center", minHeight: 200 }}>
            <Text style={{ color: "#666", fontSize: 16 }}>No posts yet</Text>
            <Text style={{ color: "#999", fontSize: 14, marginTop: 5 }}>
              Be the first to share a dining experience!
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Fixed Bottom Nav */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
        }}
      >
        <BottomNav />
      </View>
    </View>
  );
}
