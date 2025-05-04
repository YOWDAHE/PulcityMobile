import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType, ImageBackground, Dimensions } from "react-native";

interface OrganiserInfoProps {
	name: string;
	date: string;
	profileImage: string;
	coverPhoto: ImageSourcePropType;
	likesCount: string;
	commentsCount: string;
}

const { width, height } = Dimensions.get("window");

const OrganiserInfo = ({
	name,
	date,
	profileImage,
	likesCount,
	commentsCount,
	coverPhoto
}: OrganiserInfoProps) => {
	return (
		<ImageBackground
			source={coverPhoto}
			resizeMode="cover"
			style={styles.container}
		>
			<View style={styles.headerContainer}>
				<View style={styles.profileContainer}>
					<Image source={{ uri: profileImage }} style={styles.profileImage} />
					<Text style={styles.nameText}>{name}</Text>
				</View>

				<View style={styles.actionContainer}>
					<TouchableOpacity style={styles.followButton}>
						<Text style={styles.followButtonText}>Follow</Text>
					</TouchableOpacity>
					<Image
						source={{
							uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/c67e66d9e2e70634ae67fe471ce3d172460e0b6a5cea91a02084894b328a3038?placeholderIfAbsent=true&apiKey=49667187a66d454c9aceed833b59dbf5",
						}}
						style={styles.icon}
					/>
				</View>
			</View>

			<View style={styles.footerContainer}>
				<View style={styles.statsContainer}>
					<View style={styles.statItem}>
						<Ionicons name="heart-outline" size={15} />
						<Text style={styles.statText}>{likesCount}</Text>
					</View>

					<View style={styles.statItem}>
						<Ionicons name="bookmark-outline" size={15} />
						<Text style={styles.statText}>{commentsCount}</Text>
					</View>
				</View>

				<Text style={styles.dateText}>{date}</Text>
			</View>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: width,
		height: height,
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
	},
	actionContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	followButton: {
		backgroundColor: "#3b82f6",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 16,
		marginRight: 8,
	},
	followButtonText: {
		color: "#ffffff",
		fontWeight: "500",
	},
	icon: {
		width: 20,
		height: 20,
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
	},
	statIcon: {
		width: 20,
		height: 20,
		marginRight: 4,
	},
	statText: {
		fontSize: 14,
		color: "#4b5563",
	},
	dateText: {
		fontSize: 14,
		color: "#6b7280",
	},
});

export default OrganiserInfo;
