import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  PanResponder,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { fetchComments, addComment } from "@/services/api";
import { Comment } from "../types";
interface CommentsModalProps {
  visible: boolean;
  postId: number | string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  postId,
  onClose,
  onCommentAdded,
}) => {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollOffset = useRef(0);
  const isScrolling = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only respond if starting in the header area (top 100px)
        return evt.nativeEvent.pageY < 100;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond if:
        // 1. Starting in the header area
        // 2. ScrollView is at the top
        // 3. It's a downward vertical swipe
        const isInHeader = evt.nativeEvent.pageY < 100;
        const isAtTop = scrollOffset.current === 0;
        const isDownward = gestureState.dy > 5;
        const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        return isInHeader && isAtTop && isDownward && isVertical && !isScrolling.current;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward swipes when at top
        if (gestureState.dy > 0 && scrollOffset.current === 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateY.flattenOffset();
        // If swiped down more than 80px, close the modal
        if (gestureState.dy > 80 && scrollOffset.current === 0) {
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            translateY.setValue(0);
          });
        } else {
          // Spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const commentsData = await fetchComments(postId);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
      Alert.alert("Error", "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Fetch comments when modal opens
  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId, loadComments]);

  const submitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    setSubmitting(true);

    try {
      await addComment(postId, newComment.trim());

      // Clear input and refresh comments
      setNewComment("");
      await loadComments();

      // Keep scroll position at top (don't auto-scroll to bottom)

      // Notify parent component that a comment was added
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error: any) {
      console.error("Error posting comment:", error);
      Alert.alert("Error", error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={localStyles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Animated.View 
          style={[
            localStyles.modalContent,
            {
              transform: [{ translateY: translateY }],
            },
          ]}
        >
          {/* Header with drag indicator - attach pan responder here */}
          <View style={localStyles.headerContainer} {...panResponder.panHandlers}>
            <View style={localStyles.dragIndicator} />
            <View style={localStyles.header}>
              <Text style={localStyles.headerTitle}>Comments</Text>
              <TouchableOpacity 
                testID="close-comments-button"
                onPress={onClose}
                style={localStyles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments List */}
          <ScrollView 
            ref={scrollViewRef}
            style={localStyles.commentsList}
            contentContainerStyle={localStyles.commentsContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            onScroll={(event) => {
              scrollOffset.current = event.nativeEvent.contentOffset.y;
            }}
            onScrollBeginDrag={() => {
              isScrolling.current = true;
            }}
            onScrollEndDrag={() => {
              isScrolling.current = false;
            }}
            onMomentumScrollEnd={() => {
              isScrolling.current = false;
            }}
            scrollEventThrottle={16}
          >
          {loading ? (
            <View style={localStyles.centerContainer}>
              <ActivityIndicator size="large" color="#D4A574" />
              <Text style={localStyles.loadingText}>Loading comments...</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={localStyles.centerContainer}>
              <Icon name="message-circle" size={48} color="#ddd" />
              <Text style={localStyles.emptyText}>
                No comments yet
              </Text>
              <Text style={localStyles.emptySubtext}>
                Be the first to comment!
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={localStyles.commentItem}>
                <View style={localStyles.commentAvatar}>
                  <Icon name="user" size={20} color="#666" />
                </View>
                <View style={localStyles.commentContent}>
                  <View style={localStyles.commentHeader}>
                    <Text style={localStyles.commentUsername}>{comment.username}</Text>
                    <Text style={localStyles.commentDate}>
                      {formatDate(comment.created_at)}
                    </Text>
                  </View>
                  <Text style={localStyles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

          {/* Add Comment Input */}
          <View style={[localStyles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={localStyles.inputWrapper}>
              <TextInput
                style={localStyles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
                textAlignVertical="center"
              />
              <TouchableOpacity
                testID="submit-comment-button"
                onPress={submitComment}
                disabled={submitting || !newComment.trim()}
                style={localStyles.sendButton}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Icon
                    name="send"
                    size={20}
                    color={!newComment.trim() ? "#ccc" : "#007AFF"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "55%",
    minHeight: "45%",
    flex: 1,
    flexDirection: "column",
  },
  headerContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#999",
  },
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  commentDate: {
    fontSize: 12,
    color: "#999",
  },
  commentText: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
});

export default CommentsModal;
