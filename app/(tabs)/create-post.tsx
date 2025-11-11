import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import CreatePostModal from "@/components/CreatePostModal";
import { API_URL } from "@/constants/API";
import { PostData } from "@/types";

export default function CreatePostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ diningHall?: string; mealType?: string }>();
  const [visible, setVisible] = useState(true);

  const handleSubmit = async (postData: PostData) => {
    try {
      const userId = "00000000-0000-0000-0000-000000000001"; // TODO: Get from auth context
      
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      // Close modal and navigate back
      router.back();
    } catch (error) {
      console.error("Error creating post:", error);
      // TODO: Show error alert
    }
  };

  const handleClose = () => {
    setVisible(false);
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <CreatePostModal
        visible={visible}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialDiningHall={params.diningHall}
        initialMealType={params.mealType}
      />
    </View>
  );
}

