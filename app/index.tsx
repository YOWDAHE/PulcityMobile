import { Redirect } from "expo-router";
import { useAuth } from "./hooks/useAuth";

export default function Index() {

	// if (!user) {
	// 	logout();
	// }

	return <Redirect href={true ? "/(tabs)/home" : "/(auth)/login"} />;
}
