import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import FilterModal, { FilterOptions } from "@/components/FilterModal";
import { fetchPostsByDiningHall, toggleLikePost } from "@/services/api";
import { Post } from "@/types";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

export default function DiningHallProfileScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const diningHallName = params.diningHallName as string;
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headerComponentHeight, setHeaderComponentHeight] = useState(180);
  const [sortBy, setSortBy] = useState<"newest" | "rating-high" | "rating-low">("newest");
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [showMealTypeFilter, setShowMealTypeFilter] = useState(false);
  const [showDietaryFilter, setShowDietaryFilter] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState<FilterOptions>({
    allergens: [],
    mealTypes: [],
  });
  const hasLoadedRef = useRef(false);

  const loadPosts = async () => {
    if (!diningHallName) {
      console.warn('[DiningHallProfile] No diningHallName provided');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('[DiningHallProfile] Loading posts for dining hall:', diningHallName);
      const data = await fetchPostsByDiningHall(diningHallName);
      console.log('[DiningHallProfile] Posts loaded:', data.length);
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to load dining hall posts", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diningHallName && !hasLoadedRef.current) {
      loadPosts();
      hasLoadedRef.current = true;
    }
  }, [diningHallName]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current && diningHallName) {
        loadPosts();
      }
    }, [diningHallName])
  );

  const handleLike = async (postId: number | string) => {
    try {
      setPosts((prev) =>
        prev.map((p) => {
          if (String(p.id) === String(postId)) {
            const liked = !p.isLiked;
            const currentCount = Number(p.likeCount) || 0;
            return {
              ...p,
              isLiked: liked,
              likeCount: liked ? currentCount + 1 : Math.max(0, currentCount - 1),
            } as Post;
          }
          return p;
        })
      );

      await toggleLikePost(postId);
    } catch (err) {
      console.error("Error toggling like on dining hall profile:", err);
      loadPosts();
    }
  };

  const handleCommentCountUpdate = (postId: number | string, newCount: number) => {
    setPosts((prev) => prev.map((p) => (String(p.id) === String(postId) ? { ...p, commentCount: newCount } : p)));
  };

  // Get unique meal types from posts
  const mealTypes = useMemo(() => {
    const types = new Set<string>();
    posts.forEach((post) => {
      if (post.mealType) {
        types.add(post.mealType);
      }
    });
    return Array.from(types).sort();
  }, [posts]);

  // Sort and filter posts
  const sortedAndFilteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Filter by meal type (from separate filter or dietary filters)
    const mealTypeToFilter = selectedMealType || (dietaryFilters.mealTypes.length > 0 ? dietaryFilters.mealTypes[0] : null);
    if (mealTypeToFilter) {
      filtered = filtered.filter((post) => {
        if (!post.mealType) return false;
        const postMealType = post.mealType.toLowerCase();
        return postMealType.includes(mealTypeToFilter.toLowerCase()) || 
               mealTypeToFilter.toLowerCase().includes(postMealType);
      });
    }

    // Filter by dietary restrictions (allergens)
    // Since posts don't have direct allergen data, we filter based on menu item names
    // that might contain allergen keywords
    if (dietaryFilters.allergens.length > 0) {
      filtered = filtered.filter((post) => {
        // Check if any menu item contains excluded allergens
        const menuItemsText = (post.menuItems || []).join(" ").toLowerCase();
        const hasExcludedAllergen = dietaryFilters.allergens.some((allergen) => {
          const allergenLower = allergen.toLowerCase();
          // Check for allergen keywords in menu items
          return (
            menuItemsText.includes(allergenLower) ||
            (allergenLower === "nuts" && (menuItemsText.includes("nut") || menuItemsText.includes("peanut"))) ||
            (allergenLower === "dairy" && (menuItemsText.includes("milk") || menuItemsText.includes("cheese") || menuItemsText.includes("dairy"))) ||
            (allergenLower === "gluten" && (menuItemsText.includes("wheat") || menuItemsText.includes("gluten"))) ||
            (allergenLower === "eggs" && menuItemsText.includes("egg"))
          );
        });
        // Exclude posts that contain excluded allergens
        return !hasExcludedAllergen;
      });
    }

    // Sort posts
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA; // Newest first
        });
      case "rating-high":
        return filtered.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA; // High to low
        });
      case "rating-low":
        return filtered.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingA - ratingB; // Low to high
        });
      default:
        return filtered;
    }
  }, [posts, sortBy, selectedMealType, dietaryFilters]);

  const bottomNavHeight = 60 + Math.max(insets.bottom, 8);

  const renderProfileHeader = () => {
    return (
      <View
        style={styles.profileHeader}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
        }}
      >
        <View style={styles.profileTop}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Icon name="home" size={40} color="#fff" />
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{diningHallName || "Dining Hall"}</Text>
        </View>

        {/* Sort and Filter Buttons */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.filterButtonText}>Sort By</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              (dietaryFilters.allergens.length > 0 || dietaryFilters.mealTypes.length > 0) && styles.filterButtonActive
            ]}
            onPress={() => setShowDietaryFilter(true)}
          >
            <Text style={[
              styles.filterButtonText,
              (dietaryFilters.allergens.length > 0 || dietaryFilters.mealTypes.length > 0) && styles.filterButtonTextActive
            ]}>
              Dietary Restrictions
              {(dietaryFilters.allergens.length > 0 || dietaryFilters.mealTypes.length > 0) &&
                ` (${dietaryFilters.allergens.length + dietaryFilters.mealTypes.length})`}
            </Text>
          </TouchableOpacity>
          {mealTypes.length > 0 && (
            <TouchableOpacity
              style={[styles.filterButton, selectedMealType && styles.filterButtonActive]}
              onPress={() => setShowMealTypeFilter(true)}
            >
              <Text style={[styles.filterButtonText, selectedMealType && styles.filterButtonTextActive]}>
                {selectedMealType ? `Meal: ${selectedMealType}` : "Filter Meal Type"}
              </Text>
            </TouchableOpacity>
          )}
          {(selectedMealType || dietaryFilters.allergens.length > 0 || dietaryFilters.mealTypes.length > 0) && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                setSelectedMealType(null);
                setDietaryFilters({ allergens: [], mealTypes: [] });
              }}
            >
              <Icon name="x" size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!diningHallName) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Dining hall name not provided</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fixed Header */}
      <View 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0,
          zIndex: 10,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          paddingTop: insets.top,
        }}
        onLayout={(event) => {
          setHeaderComponentHeight(event.nativeEvent.layout.height);
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ 
              marginRight: 12, 
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{diningHallName || 'Dining Hall'}</Text>
          </View>
        </View>
      </View>
      
      {/* Scrollable Content */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerComponentHeight,
          paddingBottom: bottomNavHeight,
        }}
        data={sortedAndFilteredPosts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onCommentCountUpdate={handleCommentCountUpdate}
            onPostFlagged={handlePostFlagged}
          />
        )}
        ListHeaderComponent={renderProfileHeader}
        ListEmptyComponent={
          loading ? (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                marginTop: 40,
                minHeight: 200,
              }}
            >
              <ActivityIndicator size="large" color="#D4A574" />
            </View>
          ) : error ? (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                marginTop: 40,
                minHeight: 200,
              }}
            >
              <Text style={{ color: "#c00" }}>{error}</Text>
            </View>
          ) : (
            <View
              style={{
                padding: 20,
                alignItems: "center",
                marginTop: 40,
                minHeight: 200,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
                No Posts Yet
              </Text>
              <Text
                style={{ fontSize: 16, color: "#666", textAlign: "center" }}
              >
                No posts have been shared from this dining hall yet.
              </Text>
            </View>
          )
        }
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await loadPosts();
          setRefreshing(false);
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Fixed Bottom Nav */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      }}>
        <BottomNav />
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Sort By</Text>
            {[
              { value: "newest", label: "Newest" },
              { value: "rating-high", label: "Rating: High to Low" },
              { value: "rating-low", label: "Rating: Low to High" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setSortBy(option.value as "newest" | "rating-high" | "rating-low");
                  setShowSortModal(false);
                }}
                style={styles.modalOption}
              >
                <Icon
                  name={sortBy === option.value ? "check" : "circle"}
                  size={20}
                  color={sortBy === option.value ? "#007AFF" : "#ccc"}
                />
                <Text
                  style={[
                    styles.modalOptionText,
                    sortBy === option.value && styles.modalOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Meal Type Filter Modal */}
      <Modal
        visible={showMealTypeFilter}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMealTypeFilter(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMealTypeFilter(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Filter by Meal Type</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedMealType(null);
                setShowMealTypeFilter(false);
              }}
              style={styles.modalOption}
            >
              <Icon
                name={selectedMealType === null ? "check" : "circle"}
                size={20}
                color={selectedMealType === null ? "#007AFF" : "#ccc"}
              />
              <Text
                style={[
                  styles.modalOptionText,
                  selectedMealType === null && styles.modalOptionTextActive,
                ]}
              >
                All Meals
              </Text>
            </TouchableOpacity>
            {mealTypes.map((mealType) => (
              <TouchableOpacity
                key={mealType}
                onPress={() => {
                  setSelectedMealType(mealType);
                  setShowMealTypeFilter(false);
                }}
                style={styles.modalOption}
              >
                <Icon
                  name={selectedMealType === mealType ? "check" : "circle"}
                  size={20}
                  color={selectedMealType === mealType ? "#007AFF" : "#ccc"}
                />
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedMealType === mealType && styles.modalOptionTextActive,
                  ]}
                >
                  {mealType}
                </Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Dietary Restrictions Filter Modal */}
      <FilterModal
        visible={showDietaryFilter}
        onClose={() => setShowDietaryFilter(false)}
        onApply={(filters) => {
          setDietaryFilters(filters);
          setShowDietaryFilter(false);
        }}
        initialFilters={dietaryFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    backgroundColor: "#fff",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: 0,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#D4A574",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  profileInfo: {
    paddingHorizontal: 20,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  clearFilterButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
  },
  modalOptionTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

