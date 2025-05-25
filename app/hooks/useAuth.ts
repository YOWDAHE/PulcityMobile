import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VerifiedUser, User, Tokens } from "@/models/auth.model";
import { router } from "expo-router";
import { refreshToken } from "@/actions/auth.actions";
import * as Location from 'expo-location';

const USER_KEY = "pulcity_user";
const TOKEN_KEY = "pulcity_token";
const REFRESH_TOKEN_KEY = "pulcity_refresh_token";
const LOCATION_KEY = "pulcity_user_location";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Request location permissions and start tracking
  const requestAndTrackLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(locationData);
      await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(locationData));

      // Set up location tracking
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        async (newLocation) => {
          const newLocationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setLocation(newLocationData);
          await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(newLocationData));
        }
      );
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const loadAuthData = async () => {
    try {
      const [storedUser, storedAccessToken, storedRefreshToken, storedLocation] = await Promise.all([
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(LOCATION_KEY),
      ]);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
        console.log("User loaded from local storage:", JSON.parse(storedUser));
      }
      if (storedAccessToken && storedRefreshToken) {
        setTokens({ access: storedAccessToken, refresh: storedRefreshToken });
      }
      if (storedLocation) {
        setLocation(JSON.parse(storedLocation));
      }

      if (!storedLocation) {
        await requestAndTrackLocation();
      }
    } catch (error) {
      console.error("Failed to load auth data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthData();
  }, []);

  const saveAuthData = async (verifiedUser: VerifiedUser) => {
    try {
      const { user, tokens } = verifiedUser;

      console.log("Saving user and tokens:", user, tokens);

      setUser(user);
      setTokens(tokens);

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(TOKEN_KEY, tokens.access);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);

      await requestAndTrackLocation();
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  };

  const refreshUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return null;
    }
  };

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

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(LOCATION_KEY),
      ]);

      setUser(null);
      setTokens(null);
      setLocation(null);

      router.replace("/(auth)/publicPage");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const isAuthenticated = !!tokens?.access;

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    location,
    saveAuthData,
    refreshTokens,
    logout,
    requestAndTrackLocation,
    refreshUserData,
  };
};