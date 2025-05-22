import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	Platform,
} from "react-native";
import { useAuth } from "@/app/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileTabs() {
	const { user, logout } = useAuth();
	const insets = useSafeAreaInsets();

	// Default avatar if user doesn't have one
	const userAvatar =
		"https://ui-avatars.com/api/?name=" +
		encodeURIComponent(`${user?.first_name || ""} ${user?.last_name || "User"}`);

	return (
		<View style={styles.container}>
			{/* Header with gradient background */}
			{/* <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={[styles.header, { paddingTop: insets.top }]}
            > */}
			<View style={[styles.header]}>
				<View style={styles.profileContainer}>
					<Image source={{ uri: userAvatar }} style={styles.avatar} />
					<View style={styles.profileInfo}>
						<Text style={styles.username}>
							{`${user?.first_name || ""} ${user?.last_name || "User"}`}
						</Text>
						<Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
					</View>
					<TouchableOpacity style={styles.logoutButton} onPress={logout}>
						<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
					</TouchableOpacity>
				</View>
			</View>
			{/* </LinearGradient> */}

			{/* Tabs */}
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarActiveTintColor: "#3B82F6",
					tabBarInactiveTintColor: "#6B7280",
					tabBarStyle: styles.tabBar,
					tabBarLabelStyle: styles.tabBarLabel,
					tabBarIconStyle: styles.tabBarIcon,
					animation: "shift",
					tabBarPosition: "top",
				}}
			>
				<Tabs.Screen
					name="following/following"
					options={{
						tabBarLabel: "Following",
						tabBarIcon: ({ color, focused }) => (
							<View style={styles.tabIconContainer}>
								<Ionicons
									name={focused ? "people" : "people-outline"}
									color={color}
									size={22}
								/>
							</View>
						),
					}}
				/>
				<Tabs.Screen
					name="reviews/index"
					options={{
						tabBarLabel: "Reviews",
						tabBarIcon: ({ color, focused }) => (
							<View style={styles.tabIconContainer}>
								<Ionicons
									name={focused ? "star" : "star-outline"}
									color={color}
									size={22}
								/>
							</View>
						),
					}}
				/>
				<Tabs.Screen
					name="saved/saved"
					options={{
						tabBarLabel: "Saved",
						tabBarIcon: ({ color, focused }) => (
							<View style={styles.tabIconContainer}>
								<Ionicons
									name={focused ? "bookmark" : "bookmark-outline"}
									color={color}
									size={22}
								/>
							</View>
						),
					}}
				/>
				<Tabs.Screen
					name="history/history"
					options={{
						tabBarLabel: "History",
						tabBarIcon: ({ color, focused }) => (
							<View style={styles.tabIconContainer}>
								<MaterialCommunityIcons
									name={focused ? "history" : "history"}
									color={color}
									size={22}
								/>
							</View>
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
		backgroundColor: "#F9FAFB",
	},
	header: {
		paddingHorizontal: 16,
		paddingVertical: 20,
		backgroundColor: "#3B82F6",
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	profileContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	profileInfo: {
		flex: 1,
		marginLeft: 14,
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 2,
		borderColor: "#FFFFFF",
	},
	username: {
		fontSize: 18,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	userEmail: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.8)",
		marginTop: 2,
	},
	logoutButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: "rgba(0, 0, 0, 0.1)",
	},
	tabBar: {
		backgroundColor: "#FFFFFF",
		paddingTop: 10,
		height: 70,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 5,
	},
	tabBarLabel: {
		fontSize: 12,
		fontWeight: "500",
		marginTop: 0,
		// marginBottom: 4,
	},
	tabIconContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginTop: 6,
	},
	tabBarIcon: {
		marginBottom: 0,
	},
});
