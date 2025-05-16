import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/app/hooks/useAuth";

export default function ProfileTabs() {
    const { user, logout } = useAuth();

    return (
					<View style={styles.container}>
						<View style={styles.header}>
							<Text style={styles.username}>
								{`${user?.first_name} ${user?.last_name}` || "Username"}
							</Text>
							<TouchableOpacity onPress={logout}>
								<Ionicons name="log-out-outline" size={24} color="#007AFF" />
							</TouchableOpacity>
						</View>
						{/* Tabs */}
						<Tabs
							screenOptions={{
								headerShown: false,
								tabBarActiveTintColor: "#007AFF",
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
									tabBarLabel: "",
									tabBarIcon: ({ color, size }) => (
										<Ionicons name="person-outline" color={color} size={18} />
									),
								}}
							/>
							<Tabs.Screen
								name="reviews/index"
								options={{
									tabBarLabel: "",
									tabBarIcon: ({ color, size }) => (
										<Ionicons name="star-outline" color={color} size={18} />
									),
								}}
							/>
							<Tabs.Screen
								name="saved/saved"
								options={{
									tabBarLabel: "",
									tabBarIcon: ({ color, size }) => (
										<Ionicons name="bookmark-outline" color={color} size={18} />
									),
								}}
							/>
							<Tabs.Screen
								name="history/history"
								options={{
									tabBarLabel: "",
									tabBarIcon: ({ color, size }) => (
										<Ionicons name="refresh-outline" color={color} size={18} />
									),
								}}
							/>
						</Tabs>

						{/* Header */}
						<View style={styles.header}>
							<Text style={styles.username}>
								{`${user?.first_name} ${user?.last_name}` || "Username"}
							</Text>
							<TouchableOpacity onPress={logout}>
								<Ionicons name="log-out-outline" size={24} color="#007AFF" />
							</TouchableOpacity>
						</View>
					</View>
				);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    username: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    tabBar: {
        backgroundColor: "rgb(255, 255, 255)",
        display: "flex",
        flexDirection: "row",
		alignContent: "center",
        justifyContent: "center",
        shadowOpacity: 0,
        elevation: 0,
        height: 50,
    },
    tabBarLabel: {
        fontSize: 12,
        // color: "#007AFF",
    },
    tabBarIcon: {
        marginTop: -15,
    },
});