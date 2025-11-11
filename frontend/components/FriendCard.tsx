import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
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
  is_following?: boolean;
}

interface FriendCardProps {
  friend: Friend;
  onToggleFollow?: (userId: string, isCurrentlyFollowing: boolean) => Promise<void>;
  onPress?: (friend: Friend) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ friend, onToggleFollow, onPress }) => {
  const [isFollowing, setIsFollowing] = useState(friend.is_following !== false);
  const [isLoading, setIsLoading] = useState(false);

  const displayName = friend.first_name && friend.last_name
    ? `${friend.first_name} ${friend.last_name}`
    : friend.username;

  const handleToggleFollow = async () => {
    if (isLoading || !onToggleFollow) return;

    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setIsLoading(true);

    try {
      await onToggleFollow(friend.id, wasFollowing);
    } catch (error) {
      // Revert on error
      setIsFollowing(wasFollowing);
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={localStyles.container}
      onPress={() => onPress && onPress(friend)}
      activeOpacity={0.7}
    >
      <View style={localStyles.avatarContainer}>
        <Icon name="user" size={24} color="#fff" />
      </View>

      <View style={localStyles.infoContainer}>
        <Text style={localStyles.name}>{displayName}</Text>
        {friend.username && (
          <Text style={localStyles.username}>@{friend.username}</Text>
        )}
        {(friend.post_count !== undefined || friend.follower_count !== undefined) && (
          <View style={localStyles.statsContainer}>
            {friend.post_count !== undefined && (
              <Text style={localStyles.stat}>{friend.post_count} posts</Text>
            )}
            {friend.follower_count !== undefined && (
              <Text style={localStyles.stat}>
                {friend.post_count !== undefined && " • "}
                {friend.follower_count} followers
              </Text>
            )}
          </View>
        )}
      </View>

      {onToggleFollow && (
        <TouchableOpacity
          style={[
            localStyles.followButton,
            isFollowing && localStyles.followingButton,
          ]}
          onPress={handleToggleFollow}
          disabled={isLoading}
        >
          <Text
            style={[
              localStyles.followButtonText,
              isFollowing && localStyles.followingButtonText,
            ]}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D4A574",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  stat: {
    fontSize: 12,
    color: "#999",
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#D4A574",
    minWidth: 90,
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  followingButtonText: {
    color: "#666",
  },
});

export default FriendCard;
