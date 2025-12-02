import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import styles from "../styles";
import SearchResultsModal from "./SearchResultsModal";

interface HeaderProps {
  searchText: string;
  setSearchText: (s: string) => void;
  onFilterPress?: () => void;
  activeFilterCount?: number;
  onFriendRecsPress?: () => void;
  activeFriendRecs?: boolean;
  hideSearch?: boolean;
  searchPlaceholder?: string;
  disableSearchModal?: boolean;
  dishSearchMode?: boolean; // New prop for dish search mode
  showSortButton?: boolean; // Show sort button (for feed page)
  sortBy?: "newest" | "rating-high" | "rating-low" | "likes"; // Current sort option
  onSortChange?: (sort: "newest" | "rating-high" | "rating-low" | "likes") => void; // Callback when sort changes
}

const Header: React.FC<HeaderProps> = ({
  searchText,
  setSearchText,
  onFilterPress,
  activeFilterCount,
  onFriendRecsPress,
  activeFriendRecs,
  hideSearch,
  searchPlaceholder,
  disableSearchModal,
  dishSearchMode = false,
  showSortButton = false,
  sortBy = "newest",
  onSortChange,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const handleAddPress = () => {
    try {
      console.log("Navigating to create post...");
      router.push("/(tabs)/create-post" as any);
    } catch (error) {
      console.error("Error navigating to create post:", error);
      // Fallback: try alternative navigation
      router.push({
        pathname: "/(tabs)/create-post",
      } as any);
    }
  };

  const handleSettingsPress = () => {
    router.push("/(tabs)/settings-profile" as any);
  };

  const handleTrendingPress = () => {
    router.push("/(tabs)/search" as any);
  };

  const handleLogoPress = () => {
    router.push("/(tabs)" as any);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    // Regular search modal (dish search is now on separate page)
    if (!disableSearchModal && text.trim().length >= 2) {
      setSearchModalVisible(true);
    } else {
      setSearchModalVisible(false);
    }
  };

  return (
    <>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.7}>
            <Text style={styles.logo}>
              Dores<Text style={styles.logoAccent}>Dine</Text>
            </Text>
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Icon name="bell" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 20 }}
              onPress={() => router.push("/(tabs)/search")}
              accessibilityLabel="Search for Dishes"
            >
              <Icon name="search" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 20 }}
              onPress={handleSettingsPress}
              accessibilityLabel="Profile Settings"
            >
              <Icon name="settings" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginLeft: 20 }}
              onPress={handleAddPress}
              accessibilityLabel="Add Post"
            >
              <Icon name="plus" size={26} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {!hideSearch && (
          <View style={styles.searchBar}>
            {dishSearchMode && (
              <Icon name="search" size={20} color="#999" style={{ marginRight: 8 }} />
            )}
            <TextInput
              placeholder={dishSearchMode ? "Search for a dish..." : (searchPlaceholder || "Search a menu, member, etc.")}
              value={searchText}
              onChangeText={handleSearchChange}
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
            {searchText ? (
              <TouchableOpacity
                testID="clear-search-button"
                onPress={() => {
                  setSearchText("");
                  setSearchModalVisible(false);
                }}
              >
                <Icon name="x" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          {["Trending", "Friend Recs"].map((filter, idx) => {
            const isActive = filter === "Friend Recs" && activeFriendRecs;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.filterButton,
                  isActive && { backgroundColor: "#007AFF" },
                ]}
                onPress={
                  filter === "Trending"
                    ? handleTrendingPress
                    : filter === "Friend Recs" && onFriendRecsPress
                    ? onFriendRecsPress
                    : undefined
                }
              >
                <Text
                  style={[styles.filterText, isActive && { color: "#fff" }]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
          {showSortButton && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowSortModal(true)}
            >
              <Text style={styles.filterText}>
                Sort By
              </Text>
            </TouchableOpacity>
          )}
          {onFilterPress && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={onFilterPress}
            >
              <Text style={styles.filterText}>
                Filter By
                {activeFilterCount && activeFilterCount > 0
                  ? ` (${activeFilterCount})`
                  : ""}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <SearchResultsModal
        visible={searchModalVisible}
        searchText={searchText}
        onClose={() => setSearchModalVisible(false)}
      />

      {/* Sort Modal */}
      {showSortButton && (
        <Modal
          visible={showSortModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSortModal(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 20,
                width: "80%",
                maxWidth: 300,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 20 }}>
                Sort By
              </Text>
              
              {[
                { value: "newest", label: "Newest" },
                { value: "rating-high", label: "Rating: High to Low" },
                { value: "rating-low", label: "Rating: Low to High" },
                { value: "likes", label: "Most Likes" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    if (onSortChange) {
                      onSortChange(option.value as "newest" | "rating-high" | "rating-low" | "likes");
                    }
                    setShowSortModal(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f0f0f0",
                  }}
                >
                  <Icon
                    name={sortBy === option.value ? "check" : "circle"}
                    size={20}
                    color={sortBy === option.value ? "#007AFF" : "#ccc"}
                  />
                  <Text
                    style={{
                      marginLeft: 12,
                      fontSize: 16,
                      color: sortBy === option.value ? "#007AFF" : "#000",
                      fontWeight: sortBy === option.value ? "600" : "400",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

export default Header;
