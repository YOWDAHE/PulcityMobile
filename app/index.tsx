import { Redirect, useNavigation } from "expo-router";
import { useAuth } from "./hooks/useAuth";

export default function Index() {
	const navigation = useNavigation();
	const state = navigation.getState();

	console.log(state);

	return <Redirect href={true ? "/(tabs)/home" : "/(auth)/login"} />;
}
