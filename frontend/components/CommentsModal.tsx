import React, { useCallback, useEffect, useState } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { fetchComments, addComment } from "@/services/api";
import styles from "../styles";
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      loadComments();

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
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="x" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <ScrollView style={styles.commentsList}>
          {loading ? (
            <Text style={styles.loadingText}>Loading comments...</Text>
          ) : comments.length === 0 ? (
            <Text style={styles.noCommentsText}>
              No comments yet. Be the first to comment!
            </Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text style={styles.commentDate}>
                    {formatDate(comment.created_at)}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add Comment Input */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            multiline
            maxLength={500}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[
              styles.submitCommentButton,
              !newComment.trim() && styles.submitCommentButtonDisabled,
            ]}
            onPress={submitComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <Text style={styles.submitCommentButtonText}>...</Text>
            ) : (
              <Icon
                name="send"
                size={20}
                color={!newComment.trim() ? "#ccc" : "#007AFF"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentsModal;
