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
import { router, useFocusEffect } from "expo-router";
import { notificationResponse } from "@/models/notification.model";
import { useAuth } from "../hooks/useAuth";
import { fetchNotifications } from "@/actions/notification.actions";

export function Header() {
	const navigation = useNavigation();
	const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
	const translateY = useSharedValue(-200);
	const [notifications, setNotifications] = useState<notificationResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { tokens } = useAuth();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const getNotifications = async () => {
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

	// useEffect(() => {
	//     getNotifications();
	// }, [tokens]);

	useFocusEffect(
		useCallback(() => {
			getNotifications();
		}, [tokens])
	);

	const openDrawer = () => {
		navigation.dispatch(DrawerActions.openDrawer());
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

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<Text style={styles.title}>Pulcity</Text>
				<TouchableOpacity
					style={styles.notificationButton}
					onPress={() =>
						router.push({
							pathname: "/notification",
							params: { notificationsJson: JSON.stringify(notifications) },
						})
					}
				>
					<Ionicons name="notifications-outline" size={24} color="#000" />
				</TouchableOpacity>
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
	},
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 10,
		backgroundColor: "white",
		justifyContent: "space-between",
		// marginBottom: -20,
	},
	menuButton: {
		padding: 4,
	},
	title: {
		fontSize: 16,
		fontWeight: "normal",
		marginLeft: 12,
		fontFamily: "poppinsMedium",
	},
	searchButton: {
		padding: 4,
		marginLeft: "auto",
	},
	notificationButton: {
		padding: 4,
		marginLeft: 12,
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
