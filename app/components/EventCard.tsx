import React, { useEffect } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	ImageBackground,
	Dimensions,
	Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "@/models/event.model";
import { getOrganizerById } from "@/actions/organizer.actions";
import { useAuth } from "../hooks/useAuth";
import { TiptapRenderer } from "@/components/htmlRenderer";
import { router } from "expo-router";

interface EventCardProps {
	event: Event;
	showDots?: boolean;
}

const { width } = Dimensions.get("window");

const EventCard = ({ event, showDots = true }: EventCardProps) => {
	const { tokens } = useAuth();

	// useEffect(() => {
	// 	const fetchOrganizer = async () => {
	// 		try {
	// 			if (tokens?.access) {
	// 				console.log("Fetching organizer with access token:", tokens.access);
	// 				const resp = await getOrganizerById(event.organizer, tokens.access);

	// 			}
	// 		} catch (error) {
	// 			console.error("Failed to fetch organizer:", error);
	// 		}
	// 	};
	// 	fetchOrganizer();
	// }, [event]);

	return (
		<View style={styles.container}>
			{/* Cover Image */}
			<ImageBackground
				source={{ uri: event.cover_image_url }}
				resizeMode="cover"
				style={styles.imageBackground}
			>
				<View style={styles.insideImage}>
					{/* Organizer Info */}
					<View style={styles.headerContainer}>
						<View style={styles.profileContainer}>
							{/* Organizer Image */}
							<Image
								source={{
									uri: `https://via.placeholder.com/32?text=${event.organizer}`,
								}}
								style={styles.profileImage}
							/>
							<Text style={styles.nameText}>Organizer #{event.organizer}</Text>
						</View>

						{/* Follow and Notification */}
						<View style={styles.actionContainer}>
							<TouchableOpacity style={styles.followButton}>
								<Text style={styles.followButtonText}>Follow</Text>
							</TouchableOpacity>
							<Ionicons name="notifications-outline" size={20} color="white" />
						</View>
					</View>

					{/* Footer Info */}
					<View style={styles.footerContainer}>
						<View style={styles.statsContainer}>
							<View style={styles.statItem}>
								<Ionicons name="heart-outline" size={15} color="white" />
								<Text style={styles.statText}>0</Text>
							</View>

							<View style={styles.statItem}>
								<Ionicons name="bookmark-outline" size={15} color="white" />
								<Text style={styles.statText}>0</Text>
							</View>
						</View>

						<Text style={styles.dateText}>
							{new Date(event.start_date).toLocaleDateString()}
						</Text>
					</View>
				</View>
			</ImageBackground>

			{/* Event Details */}
			<View style={styles.contentContainer}>
				<Text style={styles.title}>{event.title}</Text>
				{/* <Text style={styles.description}>{event.description}</Text> */}
				<View style={styles.description}>
					<TiptapRenderer htmlContent={event.description} />
					<Pressable onPress={() => router.push(`/event/${event.id}`)}>
						<Text>... more</Text>
					</Pressable>
				</View>

				<TouchableOpacity style={styles.ticketButton}>
					<Text style={styles.ticketButtonText}>Get Your Tickets here</Text>
					<Ionicons name="chevron-forward" />
				</TouchableOpacity>

				<Text style={styles.hashtags}>#Event #Fun</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "white",
		borderRadius: 8,
		marginBottom: 16,
		overflow: "hidden",
	},
	imageBackground: {
		flex: 1,
		width: "100%",
		height: 550,
		resizeMode: "cover",
		borderRadius: 10,
		overflow: "hidden",
	},
	insideImage: {
		padding: 20,
		height: "100%",
		justifyContent: "space-between",
	},
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	profileContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	profileImage: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 8,
	},
	nameText: {
		fontWeight: "500",
		fontSize: 16,
		color: "#ffffff",
	},
	actionContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 4,
	},
	followButton: {
		marginRight: 8,
	},
	followButtonText: {
		color: "#ffffff",
	},
	footerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	statsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	statText: {
		fontSize: 14,
		color: "#ffffff",
	},
	dateText: {
		fontSize: 14,
		color: "#ffffff",
	},
	contentContainer: {
		paddingHorizontal: 10,
		paddingVertical: 8,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	description: {
		// color: "#374151",
		marginBottom: 12,
		height: 150,
		overflow: "hidden",
	},
	ticketButton: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#EBF5FF",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		marginBottom: 12,
	},
	ticketButtonText: {
		color: "#3B82F6",
		fontWeight: "500",
	},
	hashtags: {
		color: "#60A5FA",
		marginBottom: 8,
	},
});

export default EventCard;
