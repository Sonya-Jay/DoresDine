import {
    search,
    SearchDiningHall,
    SearchDish,
    SearchUser,
} from "@/services/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import styles from "../styles";

interface SearchResultsModalProps {
  visible: boolean;
  searchText: string;
  onClose: () => void;
}

type SearchResultItem = 
  | { type: "user"; data: SearchUser }
  | { type: "dining"; data: SearchDiningHall }
  | { type: "dish"; data: SearchDish };

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  visible,
  searchText,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const router = useRouter();
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (searchText.trim().length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchText]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const data = await search(searchText);
      const combined: SearchResultItem[] = [
        ...data.users.map((u) => ({ type: "user" as const, data: u })),
        ...data.diningHalls.map((h) => ({ type: "dining" as const, data: h })),
      ];
      setResults(combined);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user: SearchUser) => {
    // TODO: Navigate to user profile when implemented
    console.log("Navigate to user:", user.username);
    onClose();
  };

  const handleDiningHallPress = (hall: SearchDiningHall) => {
    onClose();
    router.push({
      pathname: "/(tabs)/schedule-details",
      params: { hallId: String(hall.id), hallName: hall.name },
    } as any);
  };

  const renderUserItem = ({ item }: { item: SearchResultItem }) => {
    if (item.type !== "user") return null;
    const user = item.data as SearchUser;

    return (
      <TouchableOpacity
        style={styles.searchResultDropdownItem}
        onPress={() => handleUserPress(user)}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#D4A574",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon name="user" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.searchResultDropdownName}>{user.username}</Text>
          <Text style={styles.searchResultDropdownSubtitle}>{user.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiningItem = ({ item }: { item: SearchResultItem }) => {
    if (item.type !== "dining") return null;
    const hall = item.data as SearchDiningHall;

    return (
      <TouchableOpacity
        style={styles.searchResultDropdownItem}
        onPress={() => handleDiningHallPress(hall)}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: "#D4A574",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon name="home" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.searchResultDropdownName}>{hall.name}</Text>
          <Text style={styles.searchResultDropdownSubtitle}>Dining Hall</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: SearchResultItem }) => {
    if (item.type === "user") {
      return renderUserItem({ item });
    } else if (item.type === "dining") {
      return renderDiningItem({ item });
    }
    return null;
  };

  return (
    <Modal
      visible={visible && searchText.trim().length >= 2}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.searchResultsOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.searchResultsDropdown,
            { maxHeight: height * 0.6 },
          ]}
        >
          {loading ? (
            <View style={styles.searchResultsLoadingContainer}>
              <ActivityIndicator size="small" color="#D4A574" />
            </View>
          ) : results.length === 0 ? (
            <View style={styles.searchResultsEmptyContainer}>
              <Text style={styles.searchResultsEmptyText}>No results found</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={(item, idx) =>
                item.type === "user"
                  ? `user-${(item.data as SearchUser).id}`
                  : `hall-${(item.data as SearchDiningHall).id}`
              }
              scrollEnabled={results.length > 5}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SearchResultsModal;
