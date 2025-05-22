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
import { Event } from "@/models/event.model";
import { useRouter } from "expo-router";

const Recommended = ({ event }: { event: Event }) => {
	const router = useRouter();

	const handlePress = () => {
		router.push(`/event/${event.id}`);
	};

	const mockImage = `https://picsum.photos/seed/${Math.random()}/200/300`;
	return (
		<TouchableOpacity style={styles.container} onPress={handlePress}>
			{/* <View style={styles.imageContainer}> */}
			<Image
				source={{ uri: event.cover_image_url[0] }}
				style={styles.coverImage}
				accessibilityLabel="Concert venue with lights"
			/>
			{/* </View> */}
			<View style={styles.contentWrapper}>
				<View style={styles.contentContainer}>
					<View style={styles.infoContainer}>
						<Text style={styles.title}>{event.title}</Text>
					</View>
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
			</View>
		</TouchableOpacity>
	);
};

export default Recommended;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		width: "100%",
		padding: 5,
		paddingVertical: 10,
		position: "relative",
		gap: 10,
		fontFamily: "Poppins",
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
		overflow: "hidden",
		flex: 1,
	},
	coverImage: {
		height: "auto",
		width: "auto",
		// resizeMode: "cover",
		flex: 1,
		borderRadius: 8,
	},
	contentWrapper: {
		flex: 2,
	},
	contentContainer: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingHorizontal: 8,
		paddingRight: 2,
		width: "100%",
		gap: 4,
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
	button: {
		height: 46,
		padding: 5,
		paddingHorizontal: 14,
		borderRadius: 5,
		borderWidth: 0.5,
		borderColor: "#457B9D",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	buttonText: {
		color: "#457B9D",
		fontSize: 14,
		// fontWeight: "500",
	},
	attendeesContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		// paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 6,
		// backgroundColor: "rgba(0,0,0,0.4)",
	},
	attendeesText: {
		// color: "white",
		fontWeight: "semibold",
		fontSize: 11,
		flex: 3,
	},
	locationRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	location: {
		color: "#666",
		fontSize: 12,
	},
});
