import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VerifiedUser, User, Tokens } from "@/models/auth.model";
import { router } from "expo-router";
import { refreshToken } from "@/actions/auth.actions";

const USER_KEY = "pulcity_user";
const TOKEN_KEY = "pulcity_token";
const REFRESH_TOKEN_KEY = "pulcity_refresh_token";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and tokens from local storage on initialization
  useEffect(() => {
    const loadAuthData = async () => {
      // console.log("Loading auth data from local storage...");
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const storedAccessToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
          console.log("User loaded from local storage:", JSON.parse(storedUser));
        }
        if (storedAccessToken && storedRefreshToken) {
          setTokens({ access: storedAccessToken, refresh: storedRefreshToken });
        }
      } catch (error) {
        console.error("Failed to load auth data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Save user and tokens to local storage
  const saveAuthData = async (verifiedUser: VerifiedUser) => {
    try {
      const { user, tokens } = verifiedUser;

      console.log("Saving user and tokens:", user, tokens);

      // Save user and tokens to local storage
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(TOKEN_KEY, tokens.access);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);

      // Update state
      setUser(user);
      setTokens(tokens);
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  };

  // Refresh tokens
  const refreshTokens = async () => {
    try {
      if (!tokens?.refresh) {
        throw new Error("Refresh token is missing. Please log in again.");
      }

      const newTokens = await refreshToken(tokens.refresh);

      await AsyncStorage.setItem(TOKEN_KEY, newTokens.access);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newTokens.refresh);

      setTokens(newTokens);

      // console.log("Tokens refreshed successfully:", newTokens);
    } catch (error) {
      console.error("Failed to refresh tokens:", error);
      throw error;
    }
  };

  // Clear user and tokens from local storage
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);

      setUser(null);
      setTokens(null);

      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return {
    user,
    tokens,
    isLoading,
    saveAuthData,
    refreshTokens,
    logout,
  };
};