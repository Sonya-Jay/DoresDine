import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import FriendsListModal from "@/components/FriendsListModal";
import { fetchUserPosts, toggleLikePost, getUserById } from "@/services/api";
import { API_ENDPOINTS, API_URL, getPhotoUrl } from "@/constants/API";
import { Post } from "@/types";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const userId = params.userId as string;
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
    if (!userId) {
      console.warn('[UserProfile] No userId provided');
      return;
    }
    try {
      console.log('[UserProfile] Loading user data for userId:', userId);
      const userData = await getUserById(userId);
      console.log('[UserProfile] User data loaded:', userData);
      setUser(userData);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      // Silently handle user data fetch failures - posts can still load
      // Only log if it's not an internal server error (which is expected until backend is deployed)
      if (err.message && !err.message.includes('Internal server error')) {
        console.warn("Failed to load user data (non-critical):", err.message);
      }
      // Don't set error - allow profile to show with posts even if user data fails
      // The user data is optional for viewing posts
      if (err.message && err.message.includes('not found')) {
        setError("User not found");
      }
      // Otherwise, continue without user data - posts might still load
      setError(null); // Clear error state for internal server errors
    }
  };

  const loadFriends = async () => {
    if (!userId) return;
    try {
      setLoadingFriends(true);
      const token = await AsyncStorage.getItem("authToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Get users that this user is following
      const response = await fetch(
        `${API_URL}/follows/following?userId=${userId}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setFriends(data);
        setFriendsCount(data.length);
      }
    } catch (err: any) {
      console.error("Failed to load friends:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadPosts = async () => {
    if (!userId) {
      console.warn('[UserProfile] No userId provided for posts');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('[UserProfile] Loading posts for userId:', userId);
      const data = await fetchUserPosts(userId);
      console.log('[UserProfile] Posts loaded:', data.length);
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to load user posts", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([loadUserData(), loadFriends(), loadPosts()]);
  };

  useEffect(() => {
    if (userId && !hasLoadedRef.current) {
      loadAllData();
      hasLoadedRef.current = true;
    }
  }, [userId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current && userId) {
        loadAllData();
      }
    }, [userId])
  );

  const handleLike = async (postId: number | string) => {
    try {
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
      console.error("Error toggling like on profile:", err);
      loadPosts();
    }
  };

  const handleCommentCountUpdate = (postId: number | string, newCount: number) => {
    setPosts((prev) => prev.map((p) => (String(p.id) === String(postId) ? { ...p, commentCount: newCount } : p)));
  };

  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  const renderProfileHeader = () => {
    // If user data failed to load but we have userId, show basic info
    const showUser = user || (userId ? { username: 'User', id: userId } : null);
    const displayName = showUser?.first_name && showUser?.last_name
      ? `${showUser.first_name} ${showUser.last_name}`
      : showUser?.username || 'User';

    return (
      <View
        style={styles.profileHeader}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
        }}
      >
        <View style={styles.profileTop}>
          <View style={styles.avatarContainer}>
            {showUser?.profile_photo ? (
              <Image
                source={{ uri: getPhotoUrl(showUser.profile_photo) }}
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
          {showUser?.username && (
            <Text style={styles.profileUsername}>@{showUser.username}</Text>
          )}
          {showUser?.bio && <Text style={styles.profileBio}>{showUser.bio}</Text>}
        </View>
      </View>
    );
  };

  if (!userId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>User ID not provided</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fixed Header */}
      <View 
        style={{ 
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
          paddingTop: insets.top,
        }}
        onLayout={(event) => {
          setHeaderComponentHeight(event.nativeEvent.layout.height);
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ 
              marginRight: 12, 
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{user?.username || 'Profile'}</Text>
          </View>
        </View>
      </View>
      
      {/* Scrollable Content */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerComponentHeight,
          paddingBottom: bottomNavHeight,
        }}
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onCommentCountUpdate={handleCommentCountUpdate}
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
                This user hasn't posted anything yet.
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

