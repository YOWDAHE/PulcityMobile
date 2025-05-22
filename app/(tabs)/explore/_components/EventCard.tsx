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
import { router } from "expo-router";

const EventCard = ({ event }: { event: Event }) => {
	const mockImage = `https://picsum.photos/seed/${Math.random()}/200/300`;
	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: event.cover_image_url[0] }}
					style={styles.coverImage}
					accessibilityLabel="Concert venue with lights"
				/>
			</View>

			<View style={styles.contentContainer}>
				<View style={styles.infoContainer}>
					<Text style={styles.title}>{event.title}</Text>
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
			</View>
			<View style={styles.attendeesContainer}>
				{/* <AttendeeAvatar /> */}
				<Text style={styles.attendeesText}>{ event.attendee_count } attendee</Text>
			</View>
			<TouchableOpacity style={styles.button} onPress={() => router.push(`/event/${event.id}`)}>
				<Text style={styles.buttonText}>Buy Tickets</Text>
				<Ionicons name="chevron-forward" color="white" />
			</TouchableOpacity>
		</View>
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
	container: {
		width: 220,
		padding: 5,
		borderRadius: 10,
		// borderWidth: 0.5,
		// borderColor: "rgba(0,0,0,0.4)",
		backgroundColor: "white",
		position: "relative",
		gap: 10,
		fontFamily: "Poppins",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	imageBackground: {
		flex: 1,
		width: "100%",
		height: 500,
		resizeMode: "cover",
		borderRadius: 10,
		overflow: "hidden",
	},
	imageContainer: {
		width: "100%",
		height: 224,
		borderRadius: 6,
		overflow: "hidden",
	},
	coverImage: {
		width: "100%",
		height: "100%",
		// resizeMode: "cover",
	},
	contentContainer: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingHorizontal: 8,
		paddingRight: 2,
		width: "100%",
	},
	infoContainer: {
		flexDirection: "column",
		gap: 10,
		width: 187,
	},
	title: {
		color: "#000",
		fontSize: 15,
		fontWeight: "400",
	},
	detailsContainer: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 15,
		opacity: 0.52,
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
		// fontWeight: "500",
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
		// backgroundColor: "rgba(0,0,0,0.4)",
	},
	attendeesText: {
		// color: "white",
		fontWeight: "semibold",
		fontSize: 11,
		flex: 2,
	},
});
