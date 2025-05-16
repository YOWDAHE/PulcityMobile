import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
	ScrollView,
	RefreshControl,
} from "react-native";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";
import { fetchNotifications } from "@/actions/notification.actions";
import { notificationResponse } from "@/models/notification.model";
import { useLocalSearchParams } from "expo-router";

const NotificationScreen = () => {
	const [notifications, setNotifications] = useState<notificationResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { tokens, refreshTokens } = useAuth();
	const [isRefreshing, setIsRefreshing] = useState(false);

    const { notificationsJson } = useLocalSearchParams();

	const getNotifications = async () => {
		console.log("fetching notifications with token:", tokens?.access);
		try {
			if (!tokens?.access) {
				console.log("Access token is missing in the notification page");
				return;
			}
			const response = await fetchNotifications(tokens?.access);

			setNotifications(response);
			setLoading(false);
		} catch (err) {
			setError("Failed to load notifications");
			setLoading(false);
			console.error(err);
        } finally {
            setIsRefreshing(false);
        }
	};

	useEffect(() => {
        // getNotifications();
        setNotifications(JSON.parse(notificationsJson as string) as notificationResponse[]);
        setLoading(false);
	}, []);

	const renderNotificationItem = ({ item }: { item: notificationResponse }) => (
		<TouchableOpacity style={styles.notificationCard}>
			<Text style={styles.title}>{item.event.title}</Text>
			<Text style={styles.message}>{item.message}</Text>
			<Text style={styles.time}>
				{new Date(item.sent_at).toLocaleString()}
			</Text>
			{/* <Text style={{ color: item.read ? "gray" : "green" }}>
				{item.read ? "Read" : "Unread"}
			</Text> */}
		</TouchableOpacity>
	);

	const onRefresh = async () => {
		setIsRefreshing(true);
		if (error != "") {
			await refreshTokens().then(getNotifications);
		} else {
			getNotifications();
        }
        // setIsRefreshing(false);
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#0000ff" />
				<Text>Loading notifications...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
				}
			>
				<View style={styles.centered}>
					<Text style={{ color: "red" }}>{error}</Text>
				</View>
			</ScrollView>
		);
	}

    return (
        
		<View style={styles.container}>
            <FlatList
                refreshControl={
					<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
				}
				data={notifications}
				keyExtractor={(item) => item.id.toString()}
				renderItem={renderNotificationItem}
				ListEmptyComponent={
					<Text style={styles.empty}>No notifications found.</Text>
				}
                
			/>
		</View>
	);
};

export default NotificationScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "white",
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 16,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	notificationCard: {
		backgroundColor: "#fff",
		padding: 16,
        marginVertical: 8,
        marginBottom: 10,
		borderBottomWidth: 0.2,
		// shadowColor: "#000",
		// shadowOffset: { width: 0, height: 2 },
		// shadowOpacity: 0.2,
		// elevation: 3,
	},
	title: {
		fontSize: 16,
		fontWeight: "bold",
	},
	message: {
		fontSize: 14,
        marginTop: 4,
        color: "black",
	},
	time: {
		fontSize: 12,
		color: "gray",
		marginTop: 4,
	},
	empty: {
		textAlign: "center",
		marginTop: 20,
		fontSize: 16,
	},
});
