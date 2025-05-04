import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "pulcity_user";
const TOKEN_KEY = "pulcity_token";
const REFRESH_TOKEN_KEY = "pulcity_refresh_token";

export const getServerAuth = async () => {
  try {
    const storedUser = await AsyncStorage.getItem(USER_KEY);
    const storedAccessToken = await AsyncStorage.getItem(TOKEN_KEY);
    const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    const user = storedUser ? JSON.parse(storedUser) : null;
    const tokens = storedAccessToken && storedRefreshToken
      ? { access: storedAccessToken, refresh: storedRefreshToken }
      : null;

    return { user, tokens };
  } catch (error) {
    console.error("Failed to retrieve auth data:", error);
    return { user: null, tokens: null };
  }
};