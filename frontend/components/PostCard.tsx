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
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import styles from "../styles";
import { ImageData, Post } from "../types";
import CommentsModal from "./CommentsModal";
import FlagPostModal from "./FlagPostModal";
import EditPostModal from "./EditPostModal";
import { flagPost, deletePost, updatePost } from "../services/api";

interface PostCardProps {
  post: Post;
  onLike?: (postId: number | string) => Promise<void>;
  onCommentCountUpdate?: (postId: number | string, newCount: number) => void;
  onCreateSimilarPost?: (diningHall: string, mealType: string) => void;
  onPostFlagged?: (postId: number | string) => void; // Callback when post is flagged
  onPostDeleted?: (postId: number | string) => void; // Callback when post is deleted
  onPostUpdated?: (postId: number | string, updates: any) => void; // Callback when post is updated
  isOwnPost?: boolean; // Whether this is the current user's post
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onCommentCountUpdate,
  onCreateSimilarPost,
  onPostFlagged,
  onPostDeleted,
  onPostUpdated,
  isOwnPost = false,
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
  const [flagModalVisible, setFlagModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

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

  const handleDiningHallPress = () => {
    if (post.dininghall) {
      console.log("[PostCard] Navigating to dining hall profile:", post.dininghall);
      router.push({
        pathname: "/(tabs)/dining-hall-profile",
        params: { diningHallName: post.dininghall },
      } as any);
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

  const handleFlag = async (reason: "misleading" | "inappropriate" | "other") => {
    try {
      await flagPost(post.id, reason);
      
      // Close the flag modal first
      setFlagModalVisible(false);
      
      // Notify parent to remove this post from the feed
      if (onPostFlagged) {
        onPostFlagged(post.id);
      }
      
      // Show confirmation after a brief delay to ensure state update
      setTimeout(() => {
        Alert.alert(
          "Post Flagged",
          "Thank you for your report. This post has been removed from your feed.",
          [{ text: "OK" }]
        );
      }, 100);
    } catch (error: any) {
      setFlagModalVisible(false);
      Alert.alert(
        "Error",
        error.message || "Failed to flag post. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(post.id);
              if (onPostDeleted) {
                onPostDeleted(post.id);
              }
              Alert.alert("Success", "Post deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete post");
            }
          },
        },
      ]
    );
  };

  const handleEdit = async (updates: any) => {
    try {
      await updatePost(post.id, updates);
      if (onPostUpdated) {
        onPostUpdated(post.id, updates);
      }
      Alert.alert("Success", "Post updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update post");
      throw error;
    }
  };

  // If post is flagged and it's the owner viewing their own post, show "Under Review" overlay
  if (post.isFlagged && isOwnPost) {
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
              <TouchableOpacity onPress={handleDiningHallPress} activeOpacity={0.7}>
                <Text style={styles.restaurant}>{post.dininghall}</Text>
              </TouchableOpacity>
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

        {/* Blurred content with "Under Review" overlay */}
        <View style={localStyles.reviewOverlay}>
          <Icon name="flag" size={48} color="#EF4444" />
          <Text style={localStyles.reviewTitle}>Under Review</Text>
          <Text style={localStyles.reviewText}>
            This post has been flagged and is being reviewed by our team.
          </Text>
        </View>
      </View>
    );
  }

  // Calculate average rating from ratedItems if available, otherwise use post.rating
  const averageRating = post.ratedItems && post.ratedItems.length > 0
    ? Math.round((post.ratedItems.reduce((sum, item) => sum + item.rating, 0) / post.ratedItems.length) * 10) / 10
    : post.rating;

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
          </View>
          
          <View style={styles.userHeader}>
            <Text style={styles.rankedText}>ranked </Text>
            <TouchableOpacity onPress={handleDiningHallPress} activeOpacity={0.7}>
              <Text style={styles.restaurant}>{post.dininghall}</Text>
            </TouchableOpacity>
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

      {/* Average Rating Bubble - Top Right */}
      <View style={[
        localStyles.ratingBubble,
        {
          borderColor:
            averageRating >= 7
              ? "#4CAF50"
              : averageRating >= 5
              ? "#FFA726"
              : "#f44336",
        },
      ]}>
        <Text style={localStyles.ratingBubbleText}>{averageRating.toFixed(1)}</Text>
      </View>

      <View style={styles.imagesContainer}>
        {post.images && post.images.length > 0 ? (
          post.images.map((img, idx) => (
            <TouchableOpacity
              key={`${img.uri}-${idx}`}
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
        ) : post.menuItems.length > 0 || (post.ratedItems && post.ratedItems.length > 0) ? (
          <View style={styles.menuItemsContainer}>
            <Text style={styles.menuItemsHeader}>What was eaten:</Text>
            
            {/* Display rated items with individual ratings */}
            {post.ratedItems && post.ratedItems.length > 0 ? (
              post.ratedItems.map((item, idx) => (
                <View key={idx} style={styles.ratedItemRow}>
                  <Text style={styles.menuItemText}>• {item.menuItemName}</Text>
                  <View
                    style={[
                      styles.itemRatingBadge,
                      {
                        borderColor:
                          item.rating >= 7
                            ? "#4CAF50"
                            : item.rating >= 5
                            ? "#FFA726"
                            : "#f44336",
                      },
                    ]}
                  >
                    <Text style={styles.itemRatingText}>{item.rating}</Text>
                  </View>
                </View>
              ))
            ) : (
              /* Fallback to menu items list */
              <>
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
              </>
            )}
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
          {!isOwnPost && (
            <TouchableOpacity
              testID="flag-button"
              onPress={() => setFlagModalVisible(true)}
              style={{ marginRight: 20 }}
            >
              <Icon name="flag" size={24} color="#666" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            testID="create-similar-button"
            onPress={handleCreateSimilarPost}
          >
            <Icon name="plus" size={24} color="#000" />
          </TouchableOpacity>
          {isOwnPost && (
            <TouchableOpacity
              style={{ marginLeft: 20 }}
              onPress={() => setShowOptionsMenu(true)}
            >
              <Icon name="more-vertical" size={24} color="#666" />
            </TouchableOpacity>
          )}
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

      {/* Flag Post Modal */}
      <FlagPostModal
        visible={flagModalVisible}
        onClose={() => setFlagModalVisible(false)}
        onFlag={handleFlag}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleEdit}
        initialCaption={post.notes}
        initialRating={post.rating}
        initialMenuItems={post.menuItems}
      />

      {/* Options Menu */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity
          style={localStyles.optionsOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={localStyles.optionsMenu}>
            <TouchableOpacity
              style={localStyles.optionsMenuItem}
              onPress={() => {
                setShowOptionsMenu(false);
                setEditModalVisible(true);
              }}
            >
              <Icon name="edit-2" size={20} color="#374151" />
              <Text style={localStyles.optionsMenuText}>Edit Post</Text>
            </TouchableOpacity>

            <View style={localStyles.optionsDivider} />

            <TouchableOpacity
              style={localStyles.optionsMenuItem}
              onPress={() => {
                setShowOptionsMenu(false);
                handleDelete();
              }}
            >
              <Icon name="trash-2" size={20} color="#EF4444" />
              <Text style={[localStyles.optionsMenuText, { color: "#EF4444" }]}>
                Delete Post
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const localStyles = StyleSheet.create({
  optionsButton: {
    padding: 8,
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  optionsMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionsMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  optionsMenuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  optionsDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  reviewOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: "#EF4444",
    borderStyle: "dashed",
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  ratingBubble: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 3,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingBubbleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});

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
