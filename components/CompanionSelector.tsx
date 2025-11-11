import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface CompanionSelectorProps {
  selectedCompanions: string[];
  onCompanionsChange: (companions: string[]) => void;
}

interface Friend {
  id: string;
  username: string;
}

const CompanionSelector: React.FC<CompanionSelectorProps> = ({
  selectedCompanions,
  onCompanionsChange,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch friends from your backend API
    // Replace with actual API call:
    // const fetchFriends = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await fetch(`${API_URL}/friends`, {
    //       headers: { 'X-User-Id': userId },
    //     });
    //     const data = await response.json();
    //     setFriends(data);
    //   } catch (error) {
    //     console.error('Failed to fetch friends:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchFriends();
  }, []);

  const toggleCompanion = (username: string) => {
    if (selectedCompanions.includes(username)) {
      onCompanionsChange(selectedCompanions.filter((c) => c !== username));
    } else {
      onCompanionsChange([...selectedCompanions, username]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="users" size={20} color="#000" />
        <Text style={styles.headerText}>Who did you go with?</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </View>

      {loading && (
        <ActivityIndicator size="small" style={{ marginVertical: 8 }} />
      )}

      {!loading && friends.length === 0 && (
        <Text style={styles.noFriendsText}>No friends yet</Text>
      )}

      {!loading && friends.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.companionList}
        >
          {friends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={[
                styles.companionChip,
                selectedCompanions.includes(friend.username) &&
                  styles.companionChipSelected,
              ]}
              onPress={() => toggleCompanion(friend.username)}
            >
              <Text
                style={[
                  styles.companionText,
                  selectedCompanions.includes(friend.username) &&
                    styles.companionTextSelected,
                ]}
              >
                {friend.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  companionList: {
    flexDirection: "row",
  },
  companionChip: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  companionChipSelected: {
    backgroundColor: "#D4A574",
    borderColor: "#D4A574",
  },
  companionText: {
    fontSize: 14,
    color: "#000",
  },
  companionTextSelected: {
    color: "#fff",
  },
  noFriendsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});

export default CompanionSelector;
