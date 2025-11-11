import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function ProfileScreen() {
  const [searchText, setSearchText] = useState("");

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <Header searchText={searchText} setSearchText={setSearchText} />
        }
        data={[]}
        keyExtractor={(item) => String(item)}
        renderItem={() => null}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center", marginTop: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
              Profile
            </Text>
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
              View and edit your profile - coming soon!
            </Text>
          </View>
        }
      />
      <BottomNav />
    </View>
  );
}

