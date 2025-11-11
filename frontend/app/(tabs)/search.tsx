import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import {
    getTrendingDishes,
    SearchDish,
} from "@/services/api";
import styles from "@/styles";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function TrendingScreen() {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [dishes, setDishes] = useState<SearchDish[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingDishes();
  }, []);

  const fetchTrendingDishes = async () => {
    setLoading(true);
    setError(null);
    try {
      const trendingDishes = await getTrendingDishes(20);
      setDishes(trendingDishes);
    } catch (err: any) {
      console.error("Error fetching trending dishes:", err);
      setError(err.message || "Failed to load trending dishes");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTrendingDishes();
  };

  const renderDishItem = ({ item, index }: { item: SearchDish; index: number }) => {
    // Calculate rank color based on position
    const getRankColor = (rank: number) => {
      if (rank === 0) return "#FFD700"; // Gold for #1
      if (rank === 1) return "#C0C0C0"; // Silver for #2
      if (rank === 2) return "#CD7F32"; // Bronze for #3
      return "#D4A574"; // Regular tan color
    };

    const getRankIcon = (rank: number) => {
      if (rank === 0) return "🥇";
      if (rank === 1) return "🥈";
      if (rank === 2) return "🥉";
      return null;
    };

    return (
      <View style={styles.trendingDishItem}>
        <View style={[styles.trendingRankBadge, { backgroundColor: getRankColor(index) }]}>
          {getRankIcon(index) ? (
            <Text style={styles.trendingRankEmoji}>{getRankIcon(index)}</Text>
          ) : (
            <Text style={styles.trendingRankText}>#{index + 1}</Text>
          )}
        </View>
        
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.trendingDishName}>{item.name}</Text>
          <View style={styles.trendingDishStats}>
            <Icon name="trending-up" size={14} color="#FF6B35" />
            <Text style={styles.trendingDishFrequency}>
              {" "}
              {item.frequency} mention{item.frequency !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View style={styles.trendingTrendIndicator}>
          <Icon name="arrow-up" size={16} color="#10B981" />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <>
            <Header searchText={searchText} setSearchText={setSearchText} />
            <View style={styles.trendingHeader}>
              <Text style={styles.trendingTitle}>🔥 Trending Now</Text>
              <Text style={styles.trendingSubtitle}>
                Most mentioned dishes this week
              </Text>
            </View>
          </>
        }
        data={dishes}
        renderItem={renderDishItem}
        keyExtractor={(item, idx) => `trending-${idx}`}
        scrollEnabled
        onRefresh={handleRefresh}
        refreshing={loading && dishes.length > 0}
        ListEmptyComponent={
          <View style={styles.trendingEmptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#D4A574" style={{ marginTop: 40 }} />
            ) : error ? (
              <>
                <Icon name="alert-circle" size={48} color="#f44336" style={{ marginBottom: 16 }} />
                <Text style={styles.trendingEmptyTitle}>Couldn't load trending dishes</Text>
                <Text style={styles.trendingEmptyText}>{error}</Text>
                <TouchableOpacity
                  style={styles.trendingRetryButton}
                  onPress={handleRefresh}
                >
                  <Text style={styles.trendingRetryText}>Try again</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Icon name="trending-up" size={48} color="#ddd" style={{ marginBottom: 16 }} />
                <Text style={styles.trendingEmptyTitle}>No trending dishes yet</Text>
                <Text style={styles.trendingEmptyText}>
                  Dishes will appear here as they get mentioned more
                </Text>
              </>
            )}
          </View>
        }
      />
      <BottomNav />
    </View>
  );
}

