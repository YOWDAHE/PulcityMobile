import React, { useEffect, useState, useRef, useCallback } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	TouchableOpacity,
	FlatList,
	ScrollView,
	Dimensions,
	RefreshControl,
	BackHandler,
	SafeAreaView,
	ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
	followOrganizer,
	getOrganizerPageDetail,
	unfollowOrganizer,
} from "@/actions/organizer.actions";
import { Event } from "@/models/event.model";
import { OrganizerPageInterface } from "@/models/organizer.model";
import EventCard from "@/app/components/EventCard";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import Loading from "@/app/components/Loading";

const ProfilePage = () => {
	const { id } = useLocalSearchParams();
	const [details, setDetails] = useState<OrganizerPageInterface>();
	const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
		null
	);
	const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<"grid" | "reviews">("grid");
	const scrollViewRef = useRef<ScrollView>(null);
	const [isFollowing, setIsFollowing] = useState(
		details?.organization.profile.is_following
	);

	// Store dynamic heights of each event card
	const [eventHeights, setEventHeights] = useState<number[]>([]);

	useEffect(() => {
		const backAction = () => {
			if (selectedEventIndex !== null) {
				setSelectedEventIndex(null);
				return true;
			} else {
				router.back();
				return true;
			}
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);
		return () => backHandler.remove();
	}, [selectedEventIndex]);

	// Calculate average rating from all events
	const calculateAverageRating = (events: Event[]) => {
		const validRatings = events.filter((event) => event.average_rating != null);
		if (validRatings.length === 0) return null;
		const sum = validRatings.reduce(
			(acc, event) => acc + (event.average_rating || 0),
			0
		);
		return (sum / validRatings.length).toFixed(1);
	};

	const fetchEvents = async () => {
		console.log("Fetching org detail");
		setLoading(true);
		const res = await getOrganizerPageDetail(Number(id));
		console.log("The detail: ", res);
		setIsFollowing(res.organization.profile.is_following);
		setDetails(res);
		setLoading(false);
	};

	useEffect(() => {
		fetchEvents();
	}, []);
	useFocusEffect(
		useCallback(() => {
			console.log("Fetching organizer details");
			fetchEvents();
		}, [])
	);

	useEffect(() => {
		// fetchEvents();
		const updateWidth = () => setScreenWidth(Dimensions.get("window").width);
		Dimensions.addEventListener("change", updateWidth);
	}, []);

	const handleImagePress = (index: number) => {
		setSelectedEventIndex(index);
	};

	const onItemLayout = (index: number) => (event: any) => {
		const { height } = event.nativeEvent.layout;
		setEventHeights((prev) => {
			const newHeights = [...prev];
			newHeights[index] = height;
			return newHeights;
		});
	};

	const handleFollow = async () => {
		try {
			setLoading(true);
			await followOrganizer(details!.organization.id);
			setIsFollowing(true);
		} catch (error) {
			console.error("Failed to follow organizer:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleUnfollow = async () => {
		try {
			setLoading(true);
			await unfollowOrganizer(details!.organization.id);
			setIsFollowing(false);
		} catch (error) {
			console.error("Failed to follow organizer:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (
			selectedEventIndex !== null &&
			eventHeights.length > selectedEventIndex &&
			eventHeights.slice(0, selectedEventIndex + 1).every((h) => h !== undefined)
		) {
			// const margin = 16;
			const offset = eventHeights
				.slice(0, selectedEventIndex)
				.reduce((sum, h) => sum + h, 0);

			scrollViewRef.current?.scrollTo({ y: offset, animated: false });
		}
	}, [eventHeights, selectedEventIndex]);

	if (details == undefined) return;

	const averageRating = calculateAverageRating(details.events);

	if (selectedEventIndex !== null) {
		return (
			<View style={{ position: "relative" }}>
				<View
					style={{
						backgroundColor: "white",
						flexDirection: "row",
						gap: 20,
						paddingHorizontal: 10,
						paddingVertical: 10,
						alignItems: "center",
						position: "sticky",
					}}
				>
					<Ionicons
						name="arrow-back"
						size={25}
						onPress={() => setSelectedEventIndex(null)}
					/>
					<Text style={{ fontSize: 20 }}>Posts</Text>
				</View>
				<ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
					{details.events.map((event, index) => (
						<View key={event.id} onLayout={onItemLayout(index)}>
							<EventCard event={event} />
						</View>
					))}
				</ScrollView>
			</View>
		);
	}

	const renderReviewsList = () => (
		<FlatList
			data={details.events.filter((event) => event.average_rating != null)}
			keyExtractor={(item) => item.id.toString()}
			renderItem={({ item }) => (
				<View style={styles.reviewItem}>
					<Text style={styles.reviewEventTitle}>{item.title}</Text>
					<View style={styles.ratingContainer}>
						<Text style={styles.ratingText}>{item.average_rating?.toFixed(1)}</Text>
						<Ionicons name="star" size={16} color="#FFD700" />
						<Text style={styles.ratingCount}>({item.rating_count} reviews)</Text>
					</View>
				</View>
			)}
			contentContainerStyle={styles.reviewsContainer}
		/>
	);

	if (loading) return <Loading />;

	return (
		<SafeAreaView style={styles.container}>
			{/* Header with back button and title */}
			<View style={styles.headerNav}>
				<TouchableOpacity
					onPress={() => router.back()}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Ionicons name="arrow-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{details.organization.profile.name}</Text>
			</View>

			{/* Profile Header */}
			<View style={styles.profileHeader}>
				{/* Profile Image */}
				<Image
					source={{ uri: details.organization.profile.logo_url }}
					style={styles.profileImage}
				/>

				{/* Stats section */}
				<View style={styles.statsSection}>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{details.eventCount}</Text>
						<Text style={styles.statLabel}>Posts</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>{details.followerCount}</Text>
						<Text style={styles.statLabel}>Followers</Text>
					</View>
					<View style={styles.statItem}>
						<View style={styles.ratingStatContainer}>
							<Text style={styles.statNumber}>{averageRating || "-"}</Text>
							{averageRating && <Ionicons name="star" size={16} color="#FFD700" />}
						</View>
						<Text style={styles.statLabel}>Av.Rating</Text>
					</View>
				</View>
			</View>

			{/* Profile Info */}
			<View style={styles.profileInfo}>
				<Text style={styles.nameText}>{details.organization.profile.name}</Text>
				<Text style={styles.categoryText}>ORGANIZER</Text>
				<Text style={styles.bioText} numberOfLines={2}>
					{details.organization.profile.description}
				</Text>
			</View>

			{/* Action Buttons */}
			<View style={styles.actionButtonsContainer}>
				{isFollowing ? (
					<TouchableOpacity style={styles.unfollowButton} onPress={handleUnfollow}>
						<Text style={styles.unfollowButtonText}>Unfollow</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity style={styles.followButton} onPress={handleFollow}>
						<Text style={styles.followButtonText}>Follow</Text>
					</TouchableOpacity>
				)}
			</View>

			<FlatList
				data={details.events.reverse()}
				renderItem={({ item, index }) => (
					<TouchableOpacity onPress={() => handleImagePress(index)}>
						<Image
							source={{ uri: item.cover_image_url[0] }}
							style={styles.eventImage}
						/>
					</TouchableOpacity>
				)}
				keyExtractor={(item) => item.id.toString()}
				horizontal={false}
				numColumns={3}
				contentContainerStyle={styles.gridContainer}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	headerNav: {
		flexDirection: "row",
		alignItems: "center",
		// justifyContent: "space-between",
		gap: 15,
		paddingHorizontal: 16,
		height: 50,
		borderBottomWidth: 0.5,
		borderBottomColor: "#ddd",
	},
	headerTitle: {
		fontSize: 16,
		fontWeight: "600",
	},
	profileHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	profileImage: {
		width: 86,
		height: 86,
		borderRadius: 43,
		marginRight: 20,
		borderWidth: 0.5,
		borderColor: "#ddd",
	},
	statsSection: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-around",
	},
	statItem: {
		alignItems: "center",
	},
	statNumber: {
		fontSize: 18,
		fontWeight: "bold",
	},
	statLabel: {
		fontSize: 12,
		color: "#666",
	},
	profileInfo: {
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	nameText: {
		fontSize: 14,
		fontWeight: "bold",
	},
	categoryText: {
		fontSize: 12,
		color: "#666",
		marginTop: 2,
		marginBottom: 4,
	},
	bioText: {
		fontSize: 14,
		marginBottom: 4,
	},
	connectionText: {
		fontSize: 12,
		color: "#666",
	},
	actionButtonsContainer: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
	followButton: {
		flex: 1,
		backgroundColor: "#3897f0",
		padding: 7,
		borderRadius: 4,
		alignItems: "center",
		marginRight: 8,
	},
	unfollowButton: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 7,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: "#ddd",
		alignItems: "center",
		marginRight: 8,
	},
	followButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
	unfollowButtonText: {
		color: "black",
		fontWeight: "600",
		fontSize: 14,
	},
	messageButton: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 7,
		borderRadius: 4,
		alignItems: "center",
		marginRight: 8,
		borderWidth: 1,
		borderColor: "#ddd",
	},
	messageButtonText: {
		fontWeight: "600",
		fontSize: 14,
	},
	moreButton: {
		width: 30,
		backgroundColor: "#fff",
		padding: 7,
		borderRadius: 4,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#ddd",
	},
	tabsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		borderTopWidth: 0.5,
		borderTopColor: "#ddd",
		borderBottomWidth: 0.5,
		borderBottomColor: "#ddd",
		paddingVertical: 10,
	},
	tab: {
		alignItems: "center",
		padding: 8,
	},
	activeTab: {
		borderBottomWidth: 1,
		borderBottomColor: "#000",
	},
	gridContainer: {
		padding: 1,
	},
	eventImage: {
		width: Dimensions.get("window").width / 3 - 2,
		height: Dimensions.get("window").width / 3 - 2,
		margin: 1,
	},
	reviewItem: {
		padding: 16,
		borderBottomWidth: 0.5,
		borderBottomColor: "#ddd",
		backgroundColor: "white",
	},
	reviewEventTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
		color: "#1a1a1a",
	},
	ratingContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	ratingText: {
		fontSize: 15,
		fontWeight: "600",
		color: "#1a1a1a",
	},
	ratingCount: {
		fontSize: 13,
		color: "#666",
		marginLeft: 4,
	},
	ratingStatContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
	},
	reviewsContainer: {
		backgroundColor: "#f5f5f5",
	},
});

export default ProfilePage;
