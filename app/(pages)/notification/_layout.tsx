import React from "react";
import { router, Stack } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function _layout() {
	return (
		<Stack
			screenOptions={{
				headerShown: true,
                headerTitle: "Notifications",
                headerBackVisible: true,
				headerLeft: (props) => (
					<TouchableOpacity {...props} onPress={() => router.push("/home")}>
						<Ionicons name="chevron-back-outline" size={24} color="#000" />
					</TouchableOpacity>
				),
			}}
		/>
	);
}
