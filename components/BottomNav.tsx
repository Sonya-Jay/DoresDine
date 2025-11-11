import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import styles from "../styles";

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const items: NavItem[] = [
    { icon: "grid", label: "Feed", route: "/(tabs)" },
    { icon: "file-text", label: "Menus", route: "/(tabs)/menus" },
    { icon: "search", label: "Search", route: "/(tabs)/search" },
    { icon: "users", label: "Friends", route: "/(tabs)/friends" },
    { icon: "user", label: "Profile", route: "/(tabs)/profile" },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        // Match route - normalize paths for comparison
        const normalizedPathname = pathname.endsWith("/") && pathname !== "/" 
          ? pathname.slice(0, -1) 
          : pathname;
        const normalizedRoute = item.route.endsWith("/") && item.route !== "/"
          ? item.route.slice(0, -1)
          : item.route;
        
        let isActive = false;
        if (item.route === "/(tabs)") {
          // Feed is active on root or tabs index (but not other tab routes)
          isActive = normalizedPathname === "/" || 
                     normalizedPathname === "/(tabs)" ||
                     normalizedPathname === "/(tabs)/" ||
                     (normalizedPathname.startsWith("/(tabs)/") && 
                      !normalizedPathname.startsWith("/(tabs)/menus") &&
                      !normalizedPathname.startsWith("/(tabs)/search") &&
                      !normalizedPathname.startsWith("/(tabs)/friends") &&
                      !normalizedPathname.startsWith("/(tabs)/profile") &&
                      !normalizedPathname.startsWith("/(tabs)/create-post"));
        } else {
          // Other routes: exact match or starts with route
          isActive = normalizedPathname === normalizedRoute || 
                     normalizedPathname.startsWith(normalizedRoute + "/");
        }
        return (
          <TouchableOpacity
            key={item.label}
            onPress={() => router.push(item.route as any)}
            style={styles.navItem}
          >
            <Icon
              name={item.icon}
              size={26}
              color={isActive ? "#000" : "#999"}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;
