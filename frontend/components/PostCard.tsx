import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import styles from "../styles";
import { Post } from "../types";
import CommentsModal from "./CommentsModal";

interface PostCardProps {
  post: Post;
  onLike?: (postId: number | string) => Promise<void>;
  onCommentCountUpdate?: (postId: number | string, newCount: number) => void;
  onCreateSimilarPost?: (diningHall: string, mealType: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onCommentCountUpdate,
  onCreateSimilarPost,
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  // Update local state when post prop changes
  React.useEffect(() => {
    setIsLiked(post.isLiked);
    setLikeCount(post.likeCount);
    setCommentCount(post.commentCount);
  }, [post.isLiked, post.likeCount, post.commentCount]);

  const handleLike = async () => {
    if (isLiking || !onLike) return;

    // Optimistic update
    const wasLiked = isLiked;
    const oldCount = likeCount;
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? oldCount - 1 : oldCount + 1);

    setIsLiking(true);
    try {
      await onLike(post.id);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikeCount(oldCount);
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentAdded = () => {
    // Update local comment count
    const newCount = commentCount + 1;
    setCommentCount(newCount);

    // Notify parent component
    if (onCommentCountUpdate) {
      onCommentCountUpdate(post.id, newCount);
    }
  };

  const handleCreateSimilarPost = () => {
    if (onCreateSimilarPost) {
      // Extract meal type from the post date string
      // The date format is like "10/21/2025 Breakfast"
      const mealType = post.date.split(" ").pop() || "Lunch";
      onCreateSimilarPost(post.dininghall, mealType);
    }
  };

  return (
    <View style={styles.post}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Icon name="user" size={24} color="#fff" />
        </View>

        <View style={styles.userDetails}>
          <View style={styles.userHeader}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.rankedText}> ranked </Text>
            <Text style={styles.restaurant}>{post.dininghall}</Text>
          </View>

          <View style={styles.metadata}>
            <View style={styles.metadataRow}>
              <Icon name="calendar" size={11} color="#666" />
              <Text style={styles.metadataText}> {post.date}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Icon name="x" size={11} color="#666" />
              <Text style={styles.metadataText}> {post.visits} Visits</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.imagesContainer}>
        {post.images.length > 0 ? (
          post.images.map((img, idx) => (
            <View
              key={idx}
              style={[
                styles.imageWrapper,
                post.images.length === 1 && styles.singleImageWrapper,
              ]}
            >
              <Image
                source={{ uri: img.uri }}
                style={styles.foodImage}
                resizeMode="cover"
                onError={(error) => {
                  console.warn('Image load error (will show placeholder):', img.uri);
                  // Image will fail to load, but we'll keep the container for layout
                }}
              />
              <View
                style={[
                  styles.rating,
                  {
                    borderColor:
                      img.rating >= 7
                        ? "#4CAF50"
                        : img.rating >= 5
                        ? "#FFA726"
                        : "#f44336",
                  },
                ]}
              >
                <Text style={styles.ratingText}>{img.rating}</Text>
              </View>
            </View>
          ))
        ) : post.menuItems.length > 0 ? (
          <View style={styles.menuItemsContainer}>
            <Text style={styles.menuItemsHeader}>What was eaten:</Text>
            {post.menuItems.map((item, idx) => (
              <View key={idx} style={styles.menuItemWrapper}>
                <Text style={styles.menuItemText}>• {item}</Text>
              </View>
            ))}
            {/* Show rating for the overall meal when no photos */}
            <View style={styles.mealRatingWrapper}>
              <View
                style={[
                  styles.mealRating,
                  {
                    borderColor:
                      post.rating >= 7
                        ? "#4CAF50"
                        : post.rating >= 5
                        ? "#FFA726"
                        : "#f44336",
                  },
                ]}
              >
                <Text style={styles.ratingText}>{post.rating}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noContentContainer}>
            <Text style={styles.noContentText}>No photos or menu items</Text>
          </View>
        )}
      </View>

      {post.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>
            <Text style={styles.notesLabel}>Notes: </Text>
            {post.notes}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={handleLike} disabled={isLiking}>
            {isLiked ? (
              <Text style={styles.filledHeart}>❤️</Text>
            ) : (
              <Icon name="heart" size={24} color="#000" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 20 }}
            onPress={() => setCommentsModalVisible(true)}
          >
            <Icon name="message-square" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 20 }}>
            <Icon name="send" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRight}>
          <TouchableOpacity onPress={handleCreateSimilarPost}>
            <Icon name="plus" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 20 }}>
            <Icon name="bookmark" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Like and comment counts */}
      <View style={styles.socialStats}>
        {likeCount > 0 && (
          <Text style={styles.likesText}>
            {likeCount} {Number(likeCount) === 1 ? "like" : "likes"}
          </Text>
        )}
        {commentCount > 0 && (
          <TouchableOpacity onPress={() => setCommentsModalVisible(true)}>
            <Text style={styles.commentsText}>
              View all {Number(commentCount)}{" "}
              {Number(commentCount) === 1 ? "comment" : "comments"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsModalVisible}
        postId={post.id}
        onClose={() => setCommentsModalVisible(false)}
        onCommentAdded={handleCommentAdded}
      />
    </View>
  );
};

export default PostCard;
