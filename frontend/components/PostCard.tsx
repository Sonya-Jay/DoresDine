import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import styles from "../styles";
import { ImageData, Post } from "../types";
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
  const router = useRouter();
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(Number(post.likeCount) || 0);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [commentCount, setCommentCount] = useState(
    Number(post.commentCount) || 0
  );
  const [expandedImage, setExpandedImage] = useState<ImageData | null>(null);

  const handleUsernamePress = () => {
    if (post.author_id) {
      console.log("[PostCard] Navigating to user profile:", post.author_id);
      router.push({
        pathname: "/(tabs)/user-profile",
        params: { userId: String(post.author_id) },
      } as any);
    } else {
      console.warn("[PostCard] No author_id found for post:", post.id);
    }
  };

  // Update local state when post prop changes
  React.useEffect(() => {
    setIsLiked(post.isLiked);
    setLikeCount(Number(post.likeCount) || 0);
    setCommentCount(Number(post.commentCount) || 0);
  }, [post.isLiked, post.likeCount, post.commentCount]);

  const handleLike = async () => {
    if (isLiking || !onLike) return;

    // Optimistic update - ensure we're working with numbers
    const wasLiked = isLiked;
    const oldCount = Number(likeCount) || 0;
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? Math.max(0, oldCount - 1) : oldCount + 1);

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
            <TouchableOpacity onPress={handleUsernamePress} activeOpacity={0.7}>
              <Text style={styles.username}>{post.username}</Text>
            </TouchableOpacity>
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
        {post.images && post.images.length > 0 ? (
          post.images.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.imageWrapper,
                post.images.length === 1 && styles.singleImageWrapper,
              ]}
              onPress={() => setExpandedImage(img)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: img.uri }}
                style={styles.foodImage}
                resizeMode="cover"
                onError={(error) => {
                  console.warn(
                    "Image load error (will show placeholder):",
                    img.uri
                  );
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
            </TouchableOpacity>
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
        ) : null}
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
          <TouchableOpacity
            testID="like-button"
            onPress={handleLike}
            disabled={isLiking}
          >
            {isLiked ? (
              <Text style={styles.filledHeart}>❤️</Text>
            ) : (
              <Icon name="heart" size={24} color="#000" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            testID="comment-button"
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
          <TouchableOpacity
            testID="create-similar-button"
            onPress={handleCreateSimilarPost}
          >
            <Icon name="plus" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 20 }}>
            <Icon name="bookmark" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Like and comment counts */}
      <View style={styles.socialStats}>
        <View style={styles.likesContainer}>
          {likeCount > 0 && (
            <Text style={styles.likesText}>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </Text>
          )}
        </View>
        {commentCount > 0 && (
          <TouchableOpacity onPress={() => setCommentsModalVisible(true)}>
            <Text style={styles.commentsText}>
              View all {commentCount}{" "}
              {commentCount === 1 ? "comment" : "comments"}
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

      {/* Image Expansion Modal */}
      <Modal
        visible={expandedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExpandedImage(null)}
      >
        <View style={imageModalStyles.modalContainer}>
          <TouchableOpacity
            style={imageModalStyles.closeButton}
            onPress={() => setExpandedImage(null)}
          >
            <Icon name="x" size={30} color="#fff" />
          </TouchableOpacity>

          {expandedImage && (
            <View style={imageModalStyles.contentContainer}>
              <Image
                source={{ uri: expandedImage.uri }}
                style={imageModalStyles.expandedImage}
                resizeMode="contain"
              />

              <View style={imageModalStyles.infoContainer}>
                {expandedImage.dishName && (
                  <Text style={imageModalStyles.dishName}>
                    {expandedImage.dishName}
                  </Text>
                )}
                <View
                  style={[
                    imageModalStyles.ratingBadge,
                    {
                      borderColor:
                        expandedImage.rating >= 7
                          ? "#4CAF50"
                          : expandedImage.rating >= 5
                          ? "#FFA726"
                          : "#f44336",
                    },
                  ]}
                >
                  <Text style={imageModalStyles.ratingText}>
                    {expandedImage.rating}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const imageModalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  contentContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  infoContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dishName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ratingBadge: {
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
});

export default PostCard;
