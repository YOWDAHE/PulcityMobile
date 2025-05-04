import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function AuthLayout() {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return <Redirect href="/(tabs)/home" />;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				gestureEnabled: false,
			}}
			initialRouteName="login"
		>
			<Stack.Screen name="welcome" />
			<Stack.Screen name="login" options={{
				animation: "slide_from_right"
			}}/>
			<Stack.Screen name="signUp" options={{
				animation: "slide_from_left"
			}}/>
		</Stack>
	);
}
