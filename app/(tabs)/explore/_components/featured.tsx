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
import { Redirect, router } from "expo-router";

const mockImage = require("../../../../assets/dummy/eventMock.png");
const Featured = () => {
	return (
		<View style={styles.wrapper}>
			<View style={styles.container}>
				<TouchableOpacity onPress={() => router.push("/event/123")}>
					<View style={styles.imageContainer}>
						<Image
							source={mockImage}
							// source={{uri: mockImage}}
							style={styles.coverImage}
							accessibilityLabel="Concert venue with lights"
						/>
					</View>
				</TouchableOpacity>

				<View style={styles.contentContainer}>
					<View style={styles.infoContainer}>
						<Text style={styles.title}>Tamino Tour 2024</Text>
						<View style={styles.detailsContainer}>
							<View style={styles.detailItem}>
								<Ionicons name="calendar" />
								<Text style={styles.detailText}>Dec 16, 2024</Text>
							</View>
							<View style={styles.detailItem}>
								<Ionicons name="time-outline" />
								<Text style={styles.detailText}>8:00 PM</Text>
							</View>
						</View>
					</View>

					<TouchableOpacity style={styles.button}>
						<Text style={styles.buttonText}>Buy Tickets</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.attendeesContainer}>
					{/* <AttendeeAvatars /> */}
					<Text style={styles.attendeesText}>+250 Going</Text>
				</View>
			</View>
		</View>
	);
};

export default Featured;

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		width: 390,
		padding: 5,
		borderRadius: 10,
		// borderWidth: 0.5,
		// borderColor: "rgba(0,0,0,0.4)",
		backgroundColor: "white",
		position: "relative",
		gap: 7,
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
		height: 124,
		borderRadius: 6,
		overflow: "hidden",
	},
	coverImage: {
		width: "100%",
		height: "100%",
		// resizeMode: "cover",
	},
	contentContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingHorizontal: 8,
		paddingRight: 2,
	},
	infoContainer: {
		flexDirection: "column",
		gap: 5,
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
		width: 176,
		height: 46,
		padding: 5,
		paddingHorizontal: 14,
		borderRadius: 5,
		backgroundColor: "#457B9D",
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "#FFF",
		fontSize: 14,
		// fontWeight: "500",
	},
	attendeesContainer: {
		position: "absolute",
		right: 11,
		top: 11,
		flexDirection: "column",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 6,
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	attendeesText: {
		color: "white",
		fontWeight: "semibold",
		fontSize: 11,
	},
});
