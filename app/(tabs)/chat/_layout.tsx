import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Stack, Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { TouchableOpacity, View, Text, Image } from "react-native";

const Layout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Groups",
					headerLargeTitle: true,
					headerTransparent: true,
					headerBlurEffect: "regular",
					headerStyle: {
						backgroundColor: "#fff",
					},
					// headerSearchBarOptions: {
					// 	placeholder: "Search",
					// },
				}}
			/>

			<Stack.Screen name="[id]" />
		</Stack>
	);
};
export default Layout;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#3B82F6",
	},
	header: {
		paddingHorizontal: 16,
		paddingVertical: 20,
		backgroundColor: "#3B82F6",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
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
