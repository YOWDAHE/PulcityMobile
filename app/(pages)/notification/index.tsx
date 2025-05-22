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
	Image,
	Alert,
} from "react-native";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notification.actions";
import { notificationResponse } from "@/models/notification.model";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const NotificationScreen = () => {
	const [notifications, setNotifications] = useState<notificationResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);

    const { notificationsJson } = useLocalSearchParams();

	const getNotifications = async () => {
		try {
			const response = await fetchNotifications();

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
        try {
            if (notificationsJson) {
                setNotifications(JSON.parse(notificationsJson as string) as notificationResponse[]);
            } else {
                getNotifications();
            }
        } catch (err) {
            console.error("Error parsing notifications:", err);
            getNotifications();
        } finally {
            setLoading(false);
        }
	}, [notificationsJson]);

	const getTimeAgo = (dateString: string) => {
		const now = new Date();
		const date = new Date(dateString);
		const diffMs = now.getTime() - date.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);

		if (diffDay > 0) {
			return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
		} else if (diffHour > 0) {
			return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
		} else if (diffMin > 0) {
			return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
		} else {
			return 'Just now';
		}
	};

	const handleMarkAsRead = async (item: notificationResponse) => {
		if (item.read) {
			// Already read, just navigate
			router.push(`/event/${item.event.id}`);
			return;
		}
		
		setMarkingAsRead(item.id);
		try {
			await markNotificationAsRead(item.id);
			
			setNotifications(notifications.map(notification => 
				notification.id === item.id 
					? { ...notification, read: true } 
					: notification
			));
			
			// Navigate to event details
			router.push(`/event/${item.event.id}`);
		} catch (err) {
			console.error("Failed to mark notification as read:", err);
			// Still navigate even if marking as read fails
			router.push(`/event/${item.event.id}`);
		} finally {
			setMarkingAsRead(null);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			setLoading(true);
			await markAllNotificationsAsRead();
			
			// Update local state to mark all notifications as read
			setNotifications(notifications.map(notification => ({ ...notification, read: true })));
			
			Alert.alert("Success", "All notifications marked as read");
		} catch (err) {
			console.error("Failed to mark all notifications as read:", err);
			Alert.alert("Error", "Failed to mark all notifications as read");
		} finally {
			setLoading(false);
		}
	};

	const renderNotificationItem = ({ item }: { item: notificationResponse }) => {
		const eventImage = item.event.cover_image_url && item.event.cover_image_url.length > 0 
			? item.event.cover_image_url[0] 
			: 'https://via.placeholder.com/60';
			
		return (
			<TouchableOpacity 
				style={[styles.notificationCard, !item.read && styles.unreadCard]} 
				onPress={() => handleMarkAsRead(item)}
				activeOpacity={0.7}
				disabled={markingAsRead === item.id}
			>
				<View style={styles.notificationContent}>
					<Image source={{ uri: eventImage }} style={styles.eventImage} />
					<View style={styles.textContainer}>
						<View style={styles.titleRow}>
							<Text style={styles.title} numberOfLines={1}>{item.event.title}</Text>
							{!item.read && <View style={styles.unreadDot} />}
						</View>
						<Text style={styles.message} numberOfLines={2}>{item.message}</Text>
						<View style={styles.timeContainer}>
							<Ionicons name="time-outline" size={12} color="#888" style={styles.timeIcon} />
							<Text style={styles.time}>{getTimeAgo(item.sent_at)}</Text>
						</View>
					</View>
					{markingAsRead === item.id && (
						<ActivityIndicator size="small" color="#00b4dd" style={styles.loadingIndicator} />
					)}
				</View>
			</TouchableOpacity>
		);
	};

	const onRefresh = async () => {
		setIsRefreshing(true);
		getNotifications();
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#00b4dd" />
				<Text style={styles.loadingText}>Loading notifications...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.errorContentContainer}
				refreshControl={
					<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
				}
			>
				<View style={styles.centered}>
					<Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
						<Text style={styles.retryText}>Try Again</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		);
	}

	// Count unread notifications
	const unreadCount = notifications.filter(n => !n.read).length;

    return (
		<View style={styles.container}>
			<FlatList
				contentContainerStyle={styles.listContainer}
				refreshControl={
					<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#00b4dd"]} />
				}
				data={notifications}
				keyExtractor={(item) => item.id.toString()}
				renderItem={renderNotificationItem}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View style={styles.headerContainer}>
						<View style={styles.headerTextContainer}>
							<Text style={styles.headerText}>
								{notifications.length > 0 
									? unreadCount > 0 
										? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` 
										: 'All caught up!'
									: 'New notifications will appear here'}
							</Text>
						</View>
						{unreadCount > 0 && (
							<TouchableOpacity 
								style={styles.markAllButton}
								onPress={handleMarkAllAsRead}
							>
								<Text style={styles.markAllText}>Mark all as read</Text>
							</TouchableOpacity>
						)}
					</View>
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons name="notifications-off-outline" size={80} color="#aaa" />
						<Text style={styles.emptyTitle}>No Notifications</Text>
						<Text style={styles.emptySubtitle}>
							You don't have any notifications yet. Check back later!
						</Text>
					</View>
				}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
			/>
		</View>
	);
};

export default NotificationScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
	listContainer: {
		padding: 16,
		flexGrow: 1,
	},
	headerContainer: {
		marginBottom: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerTextContainer: {
		flex: 1,
	},
	headerText: {
		fontSize: 14,
		color: "#666",
		fontStyle: "italic",
	},
	markAllButton: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 4,
		backgroundColor: '#f0f0f0',
	},
	markAllText: {
		fontSize: 12,
		color: "#00b4dd",
		fontWeight: "500",
	},
	loadingIndicator: {
		marginLeft: 8,
	},
	scrollView: {
		flex: 1,
	},
	errorContentContainer: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	notificationCard: {
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 4,
	},
	separator: {
		height: 1,
		backgroundColor: "#f0f0f0",
		marginVertical: 8,
	},
	unreadCard: {
		backgroundColor: "#F0F8FF",
		borderLeftWidth: 4,
		borderLeftColor: "#00b4dd",
	},
	notificationContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	eventImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12,
	},
	textContainer: {
		flex: 1,
	},
	titleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		flex: 1,
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: "#00b4dd",
		marginLeft: 8,
	},
	message: {
		fontSize: 14,
		marginTop: 4,
		color: "#666",
		lineHeight: 20,
	},
	timeContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 6,
	},
	timeIcon: {
		marginRight: 4,
	},
	time: {
		fontSize: 12,
		color: "#888",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
		marginTop: 80,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#666",
		marginTop: 16,
	},
	emptySubtitle: {
		fontSize: 14,
		color: "#888",
		textAlign: "center",
		marginTop: 8,
		lineHeight: 20,
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: "#666",
	},
	errorText: {
		color: "#FF3B30",
		fontSize: 16,
		marginTop: 12,
		textAlign: "center",
	},
	retryButton: {
		marginTop: 20,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: "#00b4dd",
		borderRadius: 8,
	},
	retryText: {
		color: "white",
		fontWeight: "600",
	},
});
