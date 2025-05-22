import React, { useState, useEffect } from "react";
import { router, Stack, useNavigation, useSegments } from "expo-router";
import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";

export default function NotificationLayout() {
	const navigation = useNavigation();
	const segments = useSegments();
	const navState = useNavigationState((state) => state);

	// Log navigation info on mount
	useEffect(() => {
		logNavigationState();
	}, []);

	const logNavigationState = () => {
		console.log("\n=== NOTIFICATION NAVIGATION STATE ===");
		console.log("Can go back:", navigation.canGoBack());

		if (navState) {
			console.log("Current route index:", navState.index);
			console.log(
				"Routes in stack:",
				navState.routes.map((r) => r.name).join(" -> ")
			);

			// Show back stack
			if (navState.index > 0) {
				console.log("Back would go to:", navState.routes[navState.index - 1].name);
			} else {
				console.log("No back navigation available in this stack");
			}
		}

		console.log("Current segments:", segments);
		console.log("=======================================\n");
	};

	const handleBackPress = () => {
		// Log navigation state before going back
		console.log("⬅️ BACK BUTTON PRESSED");
		logNavigationState();

		// Check if we can go back
		if (navigation.canGoBack()) {
			console.log("✅ Using router.back()");
			// Use Expo Router's back method instead of native navigation
			router.back();
		} else {
			console.log("⚠️ Cannot go back, redirecting to home");
			// Fallback to home if somehow we can't go back
			router.replace("/(tabs)/home");
		}
	};

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerTitle: "Notifications",
				headerTitleStyle: styles.headerTitle,
				// headerTitleAlign: "center",
				// headerShadowVisible: false,
				headerStyle: {
					backgroundColor: "#fff",
				},
				headerBackButtonDisplayMode: "default",
				header: (props) => (
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "flex-start",
							backgroundColor: "#fff",
							height: 60,
							paddingHorizontal: 16,
							elevation: 2,
						}}
					>
						<TouchableOpacity
							onPress={() => navigation.goBack()}
							style={{ marginRight: 16 }}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons name="arrow-back" size={24} color="black" />
						</TouchableOpacity>
						<Text style={{ fontSize: 18, fontWeight: "bold" }}>
							Notifications
						</Text>
					</View>
				),
			}}
		/>
	);
}

const styles = StyleSheet.create({
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	backButton: {
		marginLeft: 8,
		padding: 4,
	},
	backButtonContainer: {
		width: 30,
		height: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	markAllButton: {
		marginRight: 16,
		padding: 8,
	},
	markAllText: {
		fontSize: 14,
		color: "#00b4dd",
		fontWeight: "500",
	},
	markAllTextDisabled: {
		color: "#b3dbea",
	},
});
