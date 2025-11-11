import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import {
    search,
    SearchDiningHall,
    searchDiningHalls,
    SearchDish,
    searchDishes,
    SearchUser,
    searchUsers,
} from "@/services/api";
import styles from "@/styles";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

type SearchTab = "all" | "users" | "dining" | "dishes";

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [diningHalls, setDiningHalls] = useState<SearchDiningHall[]>([]);
  const [dishes, setDishes] = useState<SearchDish[]>([]);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        performSearch();
      } else {
        // Clear results if search is empty
        setUsers([]);
        setDiningHalls([]);
        setDishes([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    try {
      if (activeTab === "all") {
        const results = await search(searchText);
        setUsers(results.users);
        setDiningHalls(results.diningHalls);
        setDishes([]);
      } else if (activeTab === "users") {
        const results = await searchUsers(searchText);
        setUsers(results);
      } else if (activeTab === "dining") {
        const results = await searchDiningHalls(searchText);
        setDiningHalls(results);
      } else if (activeTab === "dishes") {
        const results = await searchDishes(searchText);
        setDishes(results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user: SearchUser) => {
    // Navigate to user profile
    console.log("Navigate to user:", user.username);
    // TODO: Implement user profile navigation
  };

  const handleDiningHallPress = (hall: SearchDiningHall) => {
    // Navigate to dining hall menu
    console.log("Navigate to dining hall:", hall.name);
    router.push({
      pathname: "/(tabs)/menu-items",
      params: { hallId: String(hall.id), hallName: hall.name },
    } as any);
  };

  const renderUserItem = ({ item }: { item: SearchUser }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleUserPress(item)}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#D4A574",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon name="user" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.searchResultName}>{item.username}</Text>
          {item.first_name && item.last_name && (
            <Text style={styles.searchResultSubtitle}>
              {item.first_name} {item.last_name}
            </Text>
          )}
          <Text style={styles.searchResultSubtitle}>{item.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDiningHallItem = ({ item }: { item: SearchDiningHall }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleDiningHallPress(item)}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: "#D4A574",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon name="home" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.searchResultName}>{item.name}</Text>
          <Text style={styles.searchResultSubtitle}>Dining Hall</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  const renderDishItem = ({ item }: { item: SearchDish }) => (
    <View style={styles.searchResultItem}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: "#FFC107",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon name="utensils" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.searchResultName}>{item.name}</Text>
          <Text style={styles.searchResultFrequency}>
            Mentioned {item.frequency} time{item.frequency !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (searchText.trim().length < 2) {
      return (
        <View style={styles.emptySearchState}>
          <Icon name="search" size={48} color="#ddd" style={{ marginBottom: 16 }} />
          <Text style={styles.emptySearchTitle}>Start searching</Text>
          <Text style={styles.emptySearchText}>
            Search for dining halls, members, or dishes
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.searchLoading}>
          <ActivityIndicator size="large" color="#D4A574" />
        </View>
      );
    }

    if (activeTab === "all") {
      if (users.length === 0 && diningHalls.length === 0 && dishes.length === 0) {
        return (
          <View style={styles.emptySearchState}>
            <Text style={styles.emptySearchTitle}>No results found</Text>
            <Text style={styles.emptySearchText}>Try a different search term</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={[
            ...users.map((u) => ({ type: "user" as const, data: u })),
            ...diningHalls.map((h) => ({ type: "dining" as const, data: h })),
            ...dishes.map((d) => ({ type: "dish" as const, data: d })),
          ]}
          renderItem={({ item }) => {
            if (item.type === "user") {
              return renderUserItem({ item: item.data as SearchUser });
            } else if (item.type === "dining") {
              return renderDiningHallItem({ item: item.data as SearchDiningHall });
            } else {
              return renderDishItem({ item: item.data as SearchDish });
            }
          }}
          keyExtractor={(item, idx) =>
            item.type === "user"
              ? (item.data as SearchUser).id
              : item.type === "dining"
              ? `hall-${(item.data as SearchDiningHall).id}`
              : `dish-${idx}`
          }
          scrollEnabled={false}
        />
      );
    }

    if (activeTab === "users") {
      if (users.length === 0) {
        return (
          <View style={styles.emptySearchState}>
            <Text style={styles.emptySearchTitle}>No users found</Text>
            <Text style={styles.emptySearchText}>Try a different search term</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      );
    }

    if (activeTab === "dining") {
      if (diningHalls.length === 0) {
        return (
          <View style={styles.emptySearchState}>
            <Text style={styles.emptySearchTitle}>No dining halls found</Text>
            <Text style={styles.emptySearchText}>Try a different search term</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={diningHalls}
          renderItem={renderDiningHallItem}
          keyExtractor={(item) => `hall-${item.id}`}
          scrollEnabled={false}
        />
      );
    }

    if (activeTab === "dishes") {
      if (dishes.length === 0) {
        return (
          <View style={styles.emptySearchState}>
            <Text style={styles.emptySearchTitle}>No dishes found</Text>
            <Text style={styles.emptySearchText}>Try a different search term</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={dishes}
          renderItem={renderDishItem}
          keyExtractor={(item, idx) => `dish-${idx}`}
          scrollEnabled={false}
        />
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <>
            <Header searchText={searchText} setSearchText={setSearchText} />
            {searchText.trim().length >= 2 && (
              <View style={styles.searchTabs}>
                {(["all", "users", "dining", "dishes"] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.searchTab,
                      activeTab === tab && styles.searchTabActive,
                    ]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text
                      style={[
                        styles.searchTabText,
                        activeTab === tab && styles.searchTabTextActive,
                      ]}
                    >
                      {tab === "all"
                        ? "All"
                        : tab === "users"
                        ? "Members"
                        : tab === "dining"
                        ? "Dining"
                        : "Dishes"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
        data={[]}
        renderItem={() => null}
        keyExtractor={() => "search"}
        ListEmptyComponent={
          <View style={styles.searchResults}>
            {renderContent()}
          </View>
        }
      />
      <BottomNav />
    </View>
  );
}

