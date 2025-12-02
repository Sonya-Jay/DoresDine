import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import FriendCard from "@/components/FriendCard";
import PostCard from "@/components/PostCard";
import { API_ENDPOINTS, API_URL, getPhotoUrl } from "@/constants/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Post } from "@/types";
import { searchUsers, SearchUser } from "@/services/api";
import Icon from "react-native-vector-icons/Feather";

interface Friend {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  post_count?: number;
  follower_count?: number;
  followed_at?: string;
}

export default function FriendsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "activity">("activity");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [activityPosts, setActivityPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("authToken");
    const userId = await AsyncStorage.getItem("userId");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { "x-user-id": userId } : {}),
    };
  };

  const fetchFriends = async () => {
    try {
      const headers = await getAuthHeaders();
      const url = `${API_URL}${API_ENDPOINTS.FOLLOWS_FOLLOWING}`;
      console.log('[Friends] Fetching friends from:', url);
      console.log('[Friends] Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined });
      
      const response = await fetch(url, {
        headers,
      });

      console.log('[Friends] Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to fetch friends";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        console.error('[Friends] Error response:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[Friends] Fetched', data.length, 'friends');
      setFriends(data);
    } catch (err: any) {
      console.error("Error fetching friends:", err);
      setError(err.message);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${API_ENDPOINTS.FOLLOWS_SUGGESTIONS}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      setSuggestions(data.slice(0, 5)); // Show top 5 suggestions
    } catch (err: any) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const fetchActivity = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${API_ENDPOINTS.FOLLOWS_ACTIVITY}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friend activity");
      }

      const data = await response.json();

      // Transform backend posts to frontend Post type
      const transformedPosts: Post[] = data.map((post: any) => {
        // Build images array from photos with proper format
        const images = (post.photos || [])
          .filter((photo: any) => photo.storage_key && photo.storage_key.trim().length > 0)
          .map((photo: any) => ({
            uri: getPhotoUrl(photo.storage_key),
            rating: post.rating || 5.0,
          }));

        return {
          id: post.id,
          username: post.username,
          dininghall: post.dining_hall_name || "Unknown",
          date: new Date(post.created_at).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }) + ` ${post.meal_type || ""}`,
          visits: 1,
          rating: post.rating || 5.0,
          notes: post.caption || "",
          menuItems: post.menu_items || [],
          images,
          likeCount: Number(post.like_count) || 0,
          commentCount: Number(post.comment_count) || 0,
          isLiked: post.is_liked || false,
        };
      });

      setActivityPosts(transformedPosts);
    } catch (err: any) {
      console.error("Error fetching activity:", err);
      setError(err.message);
    }
  };

  const loadData = async () => {
    try {
      setError(null);
      await Promise.all([fetchFriends(), fetchSuggestions(), fetchActivity()]);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadData();
      }
    }, [loading])
  );

  // Search users when searchText changes
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search text is empty, clear results
    if (searchText.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const results = await searchUsers(searchText.trim());
        setSearchResults(results);
      } catch (err: any) {
        console.error("Error searching users:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  const handleSearchUserPress = (user: SearchUser) => {
    setSearchText("");
    setSearchResults([]);
    router.push({
      pathname: "/(tabs)/user-profile",
      params: { userId: user.id },
    } as any);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      const headers = await getAuthHeaders();
      const url = isCurrentlyFollowing
        ? `${API_URL}${API_ENDPOINTS.UNFOLLOW_USER(userId)}`
        : `${API_URL}${API_ENDPOINTS.FOLLOW_USER(userId)}`;

      const response = await fetch(url, {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to toggle follow");
      }

      // Refresh friends, suggestions, and activity feed
      await Promise.all([
        fetchFriends(),
        fetchSuggestions(),
        fetchActivity(), // Refresh activity feed to show new posts from followed user
      ]);
    } catch (err: any) {
      console.error("Error toggling follow:", err);
      throw err;
    }
  };

  const handleLike = async (postId: number | string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      // Update local state - ensure we're working with numbers
      setActivityPosts((prevPosts) =>
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
      throw error;
    }
  };

  const handleCommentCountUpdate = (postId: number | string, newCount: number) => {
    setActivityPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, commentCount: newCount } : post
      )
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "activity" && styles.activeTab]}
        onPress={() => setActiveTab("activity")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "activity" && styles.activeTabText,
          ]}
        >
          Activity
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "friends" && styles.activeTab]}
        onPress={() => setActiveTab("friends")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "friends" && styles.activeTabText,
          ]}
        >
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFriendsList = () => (
    <>
      {friends.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Following ({friends.length})</Text>
          </View>
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={{ ...friend, is_following: true }}
              onToggleFollow={handleToggleFollow}
            />
          ))}
        </>
      )}

      {suggestions.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested Friends</Text>
          </View>
          {suggestions.map((suggestion) => (
            <FriendCard
              key={suggestion.id}
              friend={{ ...suggestion, is_following: false }}
              onToggleFollow={handleToggleFollow}
            />
          ))}
        </>
      )}

      {friends.length === 0 && suggestions.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No friends yet</Text>
          <Text style={styles.emptyText}>
            Start following people to see their dining activity!
          </Text>
        </View>
      )}
    </>
  );

  const renderActivityFeed = () => (
    <>
      {activityPosts.length > 0 ? (
        activityPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onCommentCountUpdate={handleCommentCountUpdate}
          />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptyText}>
            {friends.length === 0
              ? "Follow friends to see their dining posts here!"
              : "Your friends haven't posted anything yet."}
          </Text>
        </View>
      )}
    </>
  );

  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(180);
  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Fixed Header */}
        <View 
          onLayout={handleHeaderLayout}
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
          }}
        >
          <Header 
            searchText={searchText} 
            setSearchText={setSearchText} 
            disableSearchModal={true}
          />
        </View>

        {/* Search Results Dropdown */}
        {searchText.trim().length >= 1 && (
          <View style={[styles.searchDropdown, { top: headerHeight }]}>
            {searchLoading ? (
              <View style={styles.searchDropdownLoading}>
                <ActivityIndicator size="small" color="#D4A574" />
                <Text style={styles.searchDropdownLoadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <ScrollView 
                style={styles.searchDropdownScroll}
                keyboardShouldPersistTaps="handled"
              >
                {searchResults.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSearchUserPress(user)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultAvatar}>
                      <Icon name="user" size={20} color="#fff" />
                    </View>
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName}>
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username}
                      </Text>
                      <Text style={styles.searchResultUsername}>
                        @{user.username}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.searchDropdownEmpty}>
                <Text style={styles.searchDropdownEmptyText}>No users found</Text>
              </View>
            )}
          </View>
        )}
        
        <FlatList
          contentContainerStyle={{ 
            paddingTop: headerHeight + 20, // Header + spacing
            paddingBottom: bottomNavHeight,
          }}
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D4A574" />
              <Text style={styles.loadingText}>Loading friends...</Text>
            </View>
          }
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

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fixed Header */}
      <View 
        onLayout={handleHeaderLayout}
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
        }}
        >
          <Header 
            searchText={searchText} 
            setSearchText={setSearchText} 
            disableSearchModal={true}
          />
        </View>

        {/* Search Results Dropdown */}
        {searchText.trim().length >= 1 && (
          <View style={[styles.searchDropdown, { top: headerHeight }]}>
            {searchLoading ? (
              <View style={styles.searchDropdownLoading}>
                <ActivityIndicator size="small" color="#D4A574" />
                <Text style={styles.searchDropdownLoadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <ScrollView 
                style={styles.searchDropdownScroll}
                keyboardShouldPersistTaps="handled"
              >
                {searchResults.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSearchUserPress(user)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultAvatar}>
                      <Icon name="user" size={20} color="#fff" />
                    </View>
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName}>
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username}
                      </Text>
                      <Text style={styles.searchResultUsername}>
                        @{user.username}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.searchDropdownEmpty}>
                <Text style={styles.searchDropdownEmptyText}>No users found</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Scrollable Content */}
        <FlatList
        contentContainerStyle={{ 
          paddingTop: headerHeight + 20, // Header + reduced tab bar spacing
          paddingBottom: bottomNavHeight,
        }}
        ListHeaderComponent={renderTabBar()}
        data={[{ id: "content" }]}
        renderItem={() => (
          <View>
            {activeTab === "friends" ? renderFriendsList() : renderActivityFeed()}
          </View>
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#D4A574"]}
            tintColor="#D4A574"
          />
        }
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#D4A574",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  searchDropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 400,
    zIndex: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchDropdownScroll: {
    maxHeight: 400,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  searchResultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  searchResultUsername: {
    fontSize: 14,
    color: '#666',
  },
  searchDropdownLoading: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchDropdownLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  searchDropdownEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  searchDropdownEmptyText: {
    fontSize: 14,
    color: '#999',
  },
});
