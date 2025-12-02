import { searchDishAvailability, DishAvailability } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface DishAvailabilityModalProps {
  visible: boolean;
  searchText: string;
  onClose: () => void;
}

const DishAvailabilityModal: React.FC<DishAvailabilityModalProps> = ({
  visible,
  searchText,
  onClose,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DishAvailability | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search text is empty, clear results
    if (!searchText.trim() || searchText.trim().length < 1) {
      setResults(null);
      return;
    }

    // Debounce search by 500ms (longer for dish search since it's more expensive)
    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchDishAvailability(searchText.trim());
        setResults(data);
      } catch (error) {
        console.error("Error searching dish availability:", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  const handleHallPress = (hallId: number, hallName: string) => {
    onClose();
    router.push({
      pathname: "/(tabs)/schedule-details",
      params: {
        hallId: hallId.toString(),
        hallName: hallName,
      },
    });
  };

  return (
    <Modal
      visible={visible && searchText.trim().length >= 1}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D4A574" />
              <Text style={styles.loadingText}>Searching dining halls...</Text>
            </View>
          ) : results ? (
            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
              {/* Today Section */}
              {results.today.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Available Today</Text>
                  </View>
                  {results.today.map((hall, index) => (
                    <TouchableOpacity
                      key={`today-${hall.hallId}-${index}`}
                      style={styles.resultItem}
                      onPress={() => handleHallPress(hall.hallId, hall.hallName)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.resultIcon}>
                        <Icon name="home" size={20} color="#fff" />
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{hall.hallName}</Text>
                        {hall.mealPeriod && (
                          <Text style={styles.resultSubtitle}>{hall.mealPeriod}</Text>
                        )}
                      </View>
                      <Icon name="chevron-right" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Divider */}
              {results.today.length > 0 && results.later.length > 0 && (
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Available Later</Text>
                  <View style={styles.dividerLine} />
                </View>
              )}

              {/* Later Section */}
              {results.later.length > 0 && (
                <>
                  {results.today.length === 0 && (
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Available Later</Text>
                    </View>
                  )}
                  {results.later.map((hall, index) => (
                    <TouchableOpacity
                      key={`later-${hall.hallId}-${index}`}
                      style={styles.resultItem}
                      onPress={() => handleHallPress(hall.hallId, hall.hallName)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.resultIcon}>
                        <Icon name="calendar" size={20} color="#fff" />
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{hall.hallName}</Text>
                        <Text style={styles.resultSubtitle}>
                          {hall.date && new Date(hall.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {hall.mealPeriod && ` • ${hall.mealPeriod}`}
                        </Text>
                      </View>
                      <Icon name="chevron-right" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* No Results */}
              {results.today.length === 0 && results.later.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No dining halls found serving "{searchText}"
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : null}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    paddingTop: 100,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  scrollView: {
    maxHeight: "80%",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8f8f8",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#D4A574",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default DishAvailabilityModal;

