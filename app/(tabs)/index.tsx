import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { Post } from "@/types";
import React, { useState } from "react";
import { FlatList, View } from "react-native";

export default function FeedScreen() {
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  // TODO: Fetch posts from API
  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     try {
  //       const response = await fetch(`${API_URL}/posts`);
  //       const data = await response.json();
  //       setPosts(data);
  //     } catch (error) {
  //       console.error("Error fetching posts:", error);
  //     }
  //   };
  //   fetchPosts();
  // }, []);

  const handleLike = async (postId: number) => {
    // TODO: Implement like functionality
    // const response = await fetch(`${API_URL}/posts/${postId}/like`, {
    //   method: "POST",
    //   headers: { "X-User-Id": userId },
    // });
    console.log("Like post:", postId);
  };

  const handleCommentCountUpdate = (postId: number, newCount: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, commentCount: newCount } : post
      )
    );
  };

  const handleCreateSimilarPost = (diningHall: string, mealType: string) => {
    // TODO: Navigate to create post with pre-filled data
    console.log("Create similar post:", diningHall, mealType);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <Header searchText={searchText} setSearchText={setSearchText} />
        }
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onCommentCountUpdate={handleCommentCountUpdate}
            onCreateSimilarPost={handleCreateSimilarPost}
          />
        )}
        ListEmptyComponent={<View />}
      />
      <BottomNav />
    </View>
  );
}
