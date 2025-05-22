import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	TextInput,
	Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import Animated, {
	useAnimatedStyle,
	withSpring,
	useSharedValue,
	withTiming,
	runOnJS,
} from "react-native-reanimated";
import { router, useFocusEffect, usePathname } from "expo-router";
import { notificationResponse } from "@/models/notification.model";
import { useAuth } from "../hooks/useAuth";
import { fetchNotifications, markAllNotificationsAsRead } from "@/actions/notification.actions";
import NotificationBadge from "./NotificationBadge";

type FeedType = "all" | "following" | "upcoming";

interface HeaderProps {
	feedType?: FeedType;
	onFeedTypeChange?: (type: FeedType) => void;
	title?: String;
}

export function Header({ feedType, onFeedTypeChange, title }: HeaderProps) {
	const navigation = useNavigation();
	const pathname = usePathname();
	const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const translateY = useSharedValue(-200);
	const [notifications, setNotifications] = useState<notificationResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

	const feedOptions: { label: string; value: FeedType }[] = [
		{ label: "Pulcity", value: "all" },
		{ label: "Following", value: "following" },
		{ label: "Upcoming", value: "upcoming" },
	];

	const getNotifications = async () => {
		try {
			const response = await fetchNotifications();

			setNotifications(response);

			const unreadCount = response.filter((n) => !n.read).length;
			setHasUnreadNotifications(unreadCount > 0);
			setLoading(false);
		} catch (err) {
			setError("Failed to load notifications");
			setLoading(false);
			console.error(err);
		} finally {
			setIsRefreshing(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			getNotifications();
		}, [])
	);

	const handleFeedTypeChange = (type: FeedType) => {
		onFeedTypeChange?.(type);
		setIsDropdownOpen(false);
	};

	const showModal = () => {
		setIsSearchModalVisible(true);
		translateY.value = withSpring(0, { damping: 15 });
	};

	const hideModal = () => {
		translateY.value = withSpring(-200, { damping: 5 }, () => {
			runOnJS(setIsSearchModalVisible)(false);
		});
	};

	const modalStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateY.value }],
		};
	});

	const navigateToNotifications = () => {
		router.push({
			pathname: "/notification",
			params: { notificationsJson: JSON.stringify(notifications) },
		});
	};

	const handleNotificationPress = () => {
		if (hasUnreadNotifications) {
			setHasUnreadNotifications(false); // Reset badge when navigating to notifications
		}
		navigateToNotifications();
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{pathname === "/home" && feedType ? (
					<View style={styles.dropdownContainer}>
						<TouchableOpacity
							style={styles.dropdownButton}
							onPress={() => setIsDropdownOpen(!isDropdownOpen)}
						>
							<Text style={styles.dropdownButtonText}>
								{feedOptions.find((option) => option.value === feedType)?.label}
							</Text>
							<Ionicons
								name={isDropdownOpen ? "chevron-up" : "chevron-down"}
								size={16}
								color="#000"
								style={styles.dropdownIcon}
							/>
						</TouchableOpacity>

						{isDropdownOpen && (
							<View style={styles.dropdownMenu}>
								{feedOptions.map((option) => (
									<TouchableOpacity
										key={option.value}
										style={[
											styles.dropdownItem,
											feedType === option.value && styles.dropdownItemSelected,
										]}
										onPress={() => handleFeedTypeChange(option.value)}
									>
										<Text
											style={[
												styles.dropdownItemText,
												feedType === option.value && styles.dropdownItemTextSelected,
											]}
										>
											{option.label}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						)}
					</View>
				) : (
					<Text style={styles.title}>{title || "Pulcity"}</Text>
				)}
				<View style={styles.iconContainer}>
					<TouchableOpacity
						style={styles.notificationButton}
						onPress={handleNotificationPress}
					>
						<Ionicons name="notifications-outline" size={24} color="#000" />
						<NotificationBadge visible={hasUnreadNotifications} size="small" />
					</TouchableOpacity>
				</View>
			</View>

			<Modal
				visible={isSearchModalVisible}
				transparent={true}
				animationType="none"
				onRequestClose={hideModal}
			>
				<View style={styles.modalContainer}>
					<Animated.View style={[styles.modalContent, modalStyle]}>
						<View style={styles.searchBarContainer}>
							<TouchableOpacity onPress={hideModal} style={styles.closeButton}>
								<Ionicons name="close-outline" size={24} color="#000" />
							</TouchableOpacity>
							<View style={styles.searchInputContainer}>
								<Ionicons
									name="search-outline"
									size={20}
									color="#666"
									style={styles.searchIcon}
								/>
								<TextInput
									placeholder="Search events..."
									style={styles.searchInput}
									placeholderTextColor="#666"
									autoFocus={true}
								/>
							</View>
						</View>
					</Animated.View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		backgroundColor: "#fff",
		zIndex: 100,
		// elevation: 100,
	},
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 10,
		backgroundColor: "white",
		justifyContent: "space-between",
		zIndex: 100,
		// elevation: 100,
	},
	title: {
		fontSize: 16,
		fontWeight: "normal",
		marginLeft: 12,
		fontFamily: "poppinsMedium",
	},
	dropdownContainer: {
		position: "relative",
		zIndex: 1000,
		elevation: 1000,
		flex: 1,
		marginRight: 16,
	},
	dropdownButton: {
		flexDirection: "row",
		alignItems: "center",
		// paddingVertical: 8,
		paddingHorizontal: 12,
	},
	dropdownButtonText: {
		fontSize: 16,
		fontWeight: "600",
		fontFamily: "poppinsMedium",
	},
	dropdownIcon: {
		marginLeft: 4,
	},
	dropdownMenu: {
		position: "absolute",
		top: "100%",
		left: 0,
		right: 0,
		backgroundColor: "white",
		borderRadius: 8,
		padding: 4,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 1000,
		zIndex: 1000,
		width: '100%'
	},
	dropdownItem: {
		padding: 12,
		borderRadius: 6,
	},
	dropdownItemSelected: {
		backgroundColor: "#f0f0f0",
	},
	dropdownItemText: {
		fontSize: 14,
		fontFamily: "poppins",
	},
	dropdownItemTextSelected: {
		fontWeight: "600",
		fontFamily: "poppinsMedium",
	},
	iconContainer: {
		position: "relative",
	},
	notificationButton: {
		position: "relative",
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		paddingTop: 20,
		padding: 10,
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 20,
		paddingTop: 16,
		width: "100%",
	},
	searchBarContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	closeButton: {
		padding: 4,
		marginRight: 8,
	},
	searchInputContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		borderRadius: 20,
		paddingHorizontal: 12,
		height: 40,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: "#000",
		height: "100%",
	},
});
