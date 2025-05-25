import { Redirect, useNavigation } from "expo-router";
import { useAuth } from "./hooks/useAuth";

export default function Index() {
	const navigation = useNavigation();
	const state = navigation.getState();
	const { isAuthenticated } = useAuth();

	console.log(state);

	return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/(auth)/publicPage"} />;
}
