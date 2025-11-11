import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import styles from "../styles";
import SearchResultsModal from "./SearchResultsModal";

interface HeaderProps {
  searchText: string;
  setSearchText: (s: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchText, setSearchText }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

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

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (text.trim().length >= 2) {
      setSearchModalVisible(true);
    } else {
      setSearchModalVisible(false);
    }
  };

  return (
    <>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>
            Dores<Text style={styles.logoAccent}>Dine</Text>
          </Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Icon name="bell" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 20 }}>
              <Icon name="menu" size={24} color="#000" />
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

        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search a menu, member, etc."
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          {["Trending", "Friend Recs", "Filter By"].map((filter, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.filterButton}
              onPress={filter === "Trending" ? handleTrendingPress : undefined}
            >
              <Text style={styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <SearchResultsModal
        visible={searchModalVisible}
        searchText={searchText}
        onClose={() => setSearchModalVisible(false)}
      />
    </>
  );
};

export default Header;
