import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import FriendsListModal from "@/components/FriendsListModal";
import { fetchMyPosts, toggleLikePost, getMe } from "@/services/api";
import { API_ENDPOINTS, API_URL, getPhotoUrl } from "@/constants/API";
import { Post } from "@/types";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_photo?: string;
  bio?: string;
}

interface Friend {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_photo?: string;
  post_count?: number;
  follower_count?: number;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [headerComponentHeight, setHeaderComponentHeight] = useState(180);
  const hasLoadedRef = useRef(false);

  const loadUserData = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (err: any) {
      console.error("Failed to load user data:", err);
    }
  };

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const token = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { "x-user-id": userId } : {}),
      };

      console.log('[Profile] Fetching friends from:', `${API_URL}${API_ENDPOINTS.FOLLOWS_FOLLOWING}`);
      const response = await fetch(
        `${API_URL}${API_ENDPOINTS.FOLLOWS_FOLLOWING}`,
        { headers }
      );

      console.log('[Profile] Friends response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[Profile] Loaded', data.length, 'friends');
        setFriends(data);
        setFriendsCount(data.length);
      } else {
        const errorText = await response.text();
        console.error('[Profile] Failed to load friends:', response.status, errorText);
      }
    } catch (err: any) {
      console.error("Failed to load friends:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyPosts();
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to load my posts", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([loadUserData(), loadFriends(), loadPosts()]);
  };

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadAllData();
      hasLoadedRef.current = true;
    }
  }, []);

  // Refresh data when screen comes into focus (but not on initial load)
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        loadAllData();
      }
    }, [])
  );

  const handleLike = async (postId: number | string) => {
    try {
      // Optimistic UI update - ensure we're working with numbers
      setPosts((prev) =>
        prev.map((p) => {
          if (String(p.id) === String(postId)) {
            const liked = !p.isLiked;
            const currentCount = Number(p.likeCount) || 0;
            return {
              ...p,
              isLiked: liked,
              likeCount: liked ? currentCount + 1 : Math.max(0, currentCount - 1),
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

  const handlePostDeleted = (postId: number | string) => {
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(postId)));
  };

  const handlePostUpdated = (postId: number | string, updates: any) => {
    setPosts((prev) =>
      prev.map((p) =>
        String(p.id) === String(postId)
          ? {
              ...p,
              notes: updates.caption !== undefined ? updates.caption : p.notes,
              rating: updates.rating !== undefined ? updates.rating : p.rating,
              menuItems: updates.menu_items !== undefined ? updates.menu_items : p.menuItems,
            }
          : p
      )
    );
    // Reload to get fresh data from server
    loadPosts();
  };

  const [headerHeight, setHeaderHeight] = useState(180);
  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || "User";

  const renderProfileHeader = () => (
    <View
      style={styles.profileHeader}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setHeaderHeight(height);
      }}
    >
      <View style={styles.profileTop}>
        <View style={styles.avatarContainer}>
          {user?.profile_photo ? (
            <Image
              source={{ uri: getPhotoUrl(user.profile_photo) }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setFriendsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>{friendsCount}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{displayName}</Text>
        {user?.username && (
          <Text style={styles.profileUsername}>@{user.username}</Text>
        )}
        {user?.bio && <Text style={styles.profileBio}>{user.bio}</Text>}
      </View>
    </View>
  );

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
          paddingTop: headerComponentHeight + 20,
          paddingBottom: bottomNavHeight,
        }}
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onCommentCountUpdate={handleCommentCountUpdate}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
            isOwnPost={true}
          />
        )}
        ListHeaderComponent={renderProfileHeader}
        ListEmptyComponent={
          loading ? (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                marginTop: 40,
                minHeight: 200,
              }}
            >
              <ActivityIndicator size="large" color="#D4A574" />
            </View>
          ) : error ? (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                marginTop: 40,
                minHeight: 200,
              }}
            >
              <Text style={{ color: "#c00" }}>{error}</Text>
            </View>
          ) : (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                marginTop: 40,
                minHeight: 200,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
                No Posts Yet
              </Text>
              <Text
                style={{ fontSize: 16, color: "#666", textAlign: "center" }}
              >
                You haven't posted anything yet.
              </Text>
            </View>
          )
        }
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await loadAllData();
          setRefreshing(false);
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Friends List Modal */}
      <FriendsListModal
        visible={friendsModalVisible}
        onClose={() => setFriendsModalVisible(false)}
        friends={friends}
        loading={loadingFriends}
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

const styles = StyleSheet.create({
  profileHeader: {
    backgroundColor: "#fff",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: 0,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#f0f0f0",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#D4A574",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "600",
    color: "#fff",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  profileInfo: {
    paddingHorizontal: 20,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
  },
});

