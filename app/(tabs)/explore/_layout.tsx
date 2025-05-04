import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function SettingsLayout() {
	return (
		// <View style={styles.wrapper}>
			<Stack screenOptions={{ headerShown: false, contentStyle: styles.wrapper }} />
		// </View>
	);
}


const styles = StyleSheet.create({
	wrapper: {
		// paddingBottom: 20
	}
})