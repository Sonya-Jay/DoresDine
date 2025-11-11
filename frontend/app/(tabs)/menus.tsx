import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { fetchDiningHalls } from "@/services/api";
import { DiningHall } from "@/types";

export default function MenusScreen() {
  const [searchText, setSearchText] = useState("");
  const [halls, setHalls] = useState<DiningHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const data = await fetchDiningHalls();
        setHalls(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dining halls");
        console.error("Error fetching halls:", err);
        // Fallback to local data if API fails
        // setHalls(DINING_HALLS);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const filteredHalls = halls.filter((hall) =>
    hall.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleHallPress = (hall: DiningHall) => {
    router.push({
      pathname: "/(tabs)/schedule-details" as any,
      params: { hallId: hall.id.toString(), hallName: hall.name },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <Header searchText={searchText} setSearchText={setSearchText} />
        }
        data={filteredHalls}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f0f0f0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
            onPress={() => handleHallPress(item)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "500", color: "#000" }}>
                {item.name}
              </Text>
            </View>
            <Icon name="arrow-right" size={20} color="#666" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={{ padding: 16, color: "red", textAlign: "center" }}>
              {error}
            </Text>
          ) : (
            <Text style={{ padding: 16, textAlign: "center", color: "#999" }}>
              No dining halls found.
            </Text>
          )
        }
        scrollEnabled={true}
      />
      <BottomNav />
    </View>
  );
}

