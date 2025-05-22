import {
	ImageBackground,
	TouchableOpacity,
	StyleSheet,
	Text,
	View,
	Image,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import AttendeeAvatar from "./AttendeeAvatar";
import { Colors } from "@/constants/Colors";
import { Event } from "@/models/event.model";
import { useRouter } from "expo-router";

const EventCard = ({ event }: { event: Event }) => {
	const router = useRouter();

	const handlePress = () => {
		router.push(`/event/${event.id}`);
	};

	const mockImage = `https://picsum.photos/seed/${Math.random()}/200/300`;
	return (
		<TouchableOpacity style={styles.card} onPress={handlePress}>
			<Image
				source={{
					uri: event.cover_image_url?.[0] || "https://placehold.co/400x200",
				}}
				style={styles.image}
			/>
			<View style={styles.content}>
				<Text style={styles.title} numberOfLines={1}>
					{event.title}
				</Text>
				<View style={styles.locationRow}>
					<Ionicons name="location" size={14} color="#666" />
					<Text style={styles.location} numberOfLines={1}>
						{JSON.parse(event.location).name}
					</Text>
				</View>
				<View style={styles.detailsContainer}>
					<View style={styles.detailItem}>
						<Ionicons name="calendar" />
						<Text style={styles.detailText}>
							{new Date(event.start_date).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</Text>
					</View>
					<View style={styles.detailItem}>
						<Ionicons name="time-outline" />
						<Text style={styles.detailText}>
							{new Date(event.start_time).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</Text>
					</View>
				</View>
			</View>
			{/* <View style={styles.attendeesContainer}>
				<Text style={styles.attendeesText}>{ event.attendee_count } attendee</Text>
			</View> */}
			<TouchableOpacity
				style={styles.button}
				onPress={() => router.push(`/event/${event.id}`)}
			>
				<Text style={styles.buttonText}>Buy Tickets</Text>
				<Ionicons name="chevron-forward" color="white" />
			</TouchableOpacity>
		</TouchableOpacity>
	);
};

export default EventCard;

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	card: {
		width: 220,
		padding: 5,
		borderRadius: 10,
		backgroundColor: "white",
		position: "relative",
		gap: 10,
		fontFamily: "Poppins",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	image: {
		width: "100%",
		height: 224,
		borderRadius: 6,
		overflow: "hidden",
	},
	content: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingHorizontal: 8,
		paddingRight: 2,
		width: "100%",
		gap: 8,
	},
	title: {
		color: "#000",
		fontSize: 15,
		fontWeight: "400",
	},
	locationRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	location: {
		color: "#666",
		fontSize: 14,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	dateTime: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	date: {
		color: "#000",
		fontSize: 11,
	},
	stats: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	statText: {
		color: "#000",
		fontSize: 11,
	},
	button: {
		height: 46,
		padding: 5,
		paddingHorizontal: 14,
		borderRadius: 5,
		borderWidth: 0.5,
		backgroundColor: Colors.primary,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 14,
	},
	attendeesContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 5,
		paddingRight: 20,
		paddingVertical: 2,
		borderRadius: 6,
		paddingLeft: 8,
	},
	attendeesText: {
		fontWeight: "semibold",
		fontSize: 11,
		flex: 2,
	},
	detailsContainer: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 15,
		opacity: 0.3,
		justifyContent: "space-between",
		width: "100%",
	},
	detailItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	detailText: {
		color: "#000",
		fontSize: 11,
	},
});
