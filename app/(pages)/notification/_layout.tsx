import React, { useState, useEffect } from "react";
import { router, Stack } from "expo-router";
import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationLayout() {

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerTitle: "Notifications",
				headerTitleStyle: styles.headerTitle,
				// headerTitleAlign: "center",
				headerShadowVisible: false,
				headerStyle: {
					backgroundColor: "#fff",
				},
				headerLeft: (props) => (
					<TouchableOpacity 
						{...props} 
						onPress={() => router.replace("/home")}
						style={styles.backButton}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<View style={styles.backButtonContainer}>
							<Ionicons name="arrow-back" size={20} color="black" />
						</View>
					</TouchableOpacity>
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
		justifyContent: 'center',
		alignItems: 'center',
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
