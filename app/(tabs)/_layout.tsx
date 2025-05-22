import { Tabs, Redirect, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { Header } from "../components/Header";
import * as Font from "expo-font";
import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_600SemiBold,
	useFonts,
} from "@expo-google-fonts/poppins";
import NotificationBadge from "../components/NotificationBadge";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { fetchNotifications } from "@/actions/notification.actions";

export default function TabLayout() {
	// const { isAuthenticated, isLoading } = useAuth();
	const pathname = usePathname();
	const { tokens } = useAuth();
	const isChatDetailScreen = pathname.startsWith("/chat");
	const isHomeScreen = pathname.startsWith("/home");
	const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

	const [fontsLoaded] = useFonts({
		Poppins_400Regular,	
		Poppins_500Medium,
		Poppins_600SemiBold,
	});

	useEffect(() => {
		// Check for unread notifications
		const checkNotifications = async () => {
			try {
				if (tokens?.access) {
					const notifications = await fetchNotifications();
					const unreadCount = notifications.filter(n => !n.read).length;
					setHasUnreadNotifications(unreadCount > 0);
				}
			} catch (error) {
				console.error("Failed to fetch notifications:", error);
			}
		};

		checkNotifications();
		
		// Set up a refresh interval (every 2 minutes)
		const interval = setInterval(checkNotifications, 120000);
		
		return () => clearInterval(interval);
	}, [tokens]);

	// if (isLoading) {
	// 	return (
	// 		<View style={styles.loadingContainer}>
	// 			<ActivityIndicator size="large" color="#007AFF" />
	// 		</View>
	// 	);
	// }

	// if (!isAuthenticated) {
	// 	return <Redirect href="/(auth)/login" />;
	// }

	return (
		<View style={styles.container}>
			{/* {!isChatDetailScreen && !isHomeScreen && <Header />} */}
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarActiveTintColor: "#007AFF",
					tabBarStyle: [
						styles.tabBar,
						{
							display: pathname.includes('/chat/') ? "none" : "flex",
						},
					],
					tabBarLabelStyle: styles.tabBarLabel,
					tabBarIconStyle: styles.tabBarIcon,
					animation: "shift",
				}}
			>
				<Tabs.Screen
					name="home/index"
					options={{
						headerShown: false,
						title: "Home",
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="home-outline" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="explore"
					options={{
						headerShown: false,
						title: "Explore",
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="compass-outline" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="chat"
					options={{
						headerShown: false,
						title: "Messages",
						tabBarIcon: ({ color, size }) => (
							<View style={styles.iconContainer}>
								<Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
								<NotificationBadge visible={hasUnreadNotifications} size="small" />
							</View>
						),
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						headerShown: false,
						title: "Profile",
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="person-outline" size={size} color={color} />
						),
					}}
				/>
			</Tabs>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// position: "relative",
	},
	iconContainer: {
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	tabBar: {
		// backgroundColor: "rgba(238, 242, 255, 0.99)",
		backgroundColor: "rgb(255, 255, 255)",
		// borderColor: "#E5E5E5",
		// borderRadius: 100,
		position: "absolute",
		height: 50,
		// elevation: 0,
		shadowOpacity: 0,
		// marginBottom: 20,
		// marginHorizontal: 35,
		alignContent: "center",
		justifyContent: "center",
	},
	tabBarLabel: {
		marginBottom: 8,
		display: "none",
	},
	tabBarIcon: {
		// marginTop: 8,
		height: "100%",
	},
});
