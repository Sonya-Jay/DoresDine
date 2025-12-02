import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface FlagPostModalProps {
  visible: boolean;
  onClose: () => void;
  onFlag: (reason: "misleading" | "inappropriate" | "other") => Promise<void>;
}

const FlagPostModal: React.FC<FlagPostModalProps> = ({
  visible,
  onClose,
  onFlag,
}) => {
  const [loading, setLoading] = useState(false);

  const handleFlag = async (reason: "misleading" | "inappropriate" | "other") => {
    setLoading(true);
    try {
      await onFlag(reason);
      onClose();
    } catch (error) {
      console.error("Error flagging post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Icon name="flag" size={24} color="#EF4444" />
            <Text style={styles.title}>Why are you flagging this post?</Text>
          </View>

          <Text style={styles.subtitle}>
            This post will be reviewed by our team. False reports may result in penalties.
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleFlag("misleading")}
              disabled={loading}
            >
              <Icon name="alert-circle" size={20} color="#D4A574" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Misleading Content</Text>
                <Text style={styles.optionDescription}>
                  False information about food, ratings, or dining hall
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleFlag("inappropriate")}
              disabled={loading}
            >
              <Icon name="x-circle" size={20} color="#D4A574" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Inappropriate Content</Text>
                <Text style={styles.optionDescription}>
                  Offensive, hateful, or violates community guidelines
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleFlag("other")}
              disabled={loading}
            >
              <Icon name="more-horizontal" size={20} color="#D4A574" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Other</Text>
                <Text style={styles.optionDescription}>
                  Other policy violations or concerns
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#D4A574" />
              <Text style={styles.loadingText}>Submitting report...</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginLeft: 12,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#FFFBF5",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D4A574",
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});

export default FlagPostModal;
