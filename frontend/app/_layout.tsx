import { getMe, initAuthFromStorage } from "@/services/api";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "login", // Start with login, will redirect to tabs if authenticated
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = "light"; // Force light mode
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // On mount, initialize auth from storage and fetch current user.
  useEffect(() => {
    (async () => {
      try {
        await initAuthFromStorage();
        // If token exists but /users/me fails, treat user as unauthenticated
        await getMe();
        // User is authenticated
        setIsAuthenticated(true);
        // Navigate to tabs if not already there - use replace to prevent going back
        const currentPath = (router as any).pathname || "";
        if (!currentPath.includes("(tabs)")) {
          router.replace("/(tabs)");
        }
      } catch (err) {
        console.log("Auth check failed, user not authenticated:", err);
        // Clear stored token
        try {
          await AsyncStorage.removeItem("authToken");
        } catch (e) {
          /* ignore */
        }
        setIsAuthenticated(false);
        // Navigate to login if not already on auth screens
        const currentPath = (router as any).pathname || "";
        if (
          !currentPath.includes("login") &&
          !currentPath.includes("register") &&
          !currentPath.includes("verify")
        ) {
          router.replace("/login");
        }
      }
    })();
  }, [router]);

  // Export function to update auth state (for login/verify screens)
  useEffect(() => {
    // Store setAuth function globally so login/verify can call it
    (global as any).setAuthState = setIsAuthenticated;
    return () => {
      delete (global as any).setAuthState;
    };
  }, []);

  // Render Stack with all screens (Expo Router requires all routes to be registered)
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="verify"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
