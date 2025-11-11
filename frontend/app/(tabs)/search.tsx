import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

export default function SearchScreen() {
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
              Search
            </Text>
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
              Search for menus, users, and more - coming soon!
            </Text>
          </View>
        }
      />
      <BottomNav />
    </View>
  );
}

