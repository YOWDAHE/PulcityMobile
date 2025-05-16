import React, { useState } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Pressable,
	Touchable,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "@/models/event.model";
import {
	followOrganizer,
	unfollowOrganizer,
} from "@/actions/organizer.actions";
import { bookmarkEvent, likeEvent } from "@/actions/event.actions";
import { TiptapRenderer } from "@/components/htmlRenderer";
import { router } from "expo-router";
import { ResizeMode, Video } from "expo-av";

interface EventCardProps {
	event: Event;
	showDots?: boolean;
}

const EventCard = ({ event, showDots = true }: EventCardProps) => {
	const [showActions, setActionsShown] = useState(false);
	const [isFollowing, setIsFollowing] = useState(
		event.organizer.profile.is_following
	);
	const [isLiked, setIsLiked] = useState(event.liked);
	const [loading, setLoading] = useState(false);

	const handleFollow = async () => {
		try {
			setLoading(true);
			await followOrganizer(event.organizer.id);
			setIsFollowing(true);
			setIsFollowing(true);
			console.log(
				`Successfully followed organizer: ${event.organizer.profile.name}`
			);
		} catch (error) {
			console.error("Failed to follow organizer:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleUnfollow = async () => {
		try {
			setLoading(true);
			await unfollowOrganizer(event.organizer.id);
			setActionsShown(false);
			setIsFollowing(false);
			console.log(
				`Successfully followed organizer: ${event.organizer.profile.name}`
			);
		} catch (error) {
			console.error("Failed to follow organizer:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLike = async () => {
		try {
			setLoading(true);
			await likeEvent(event.id);
			setIsLiked(true);
			console.log(`Successfully liked event: ${event.title}`);
		} catch (error) {
			console.error("Failed to like event:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleBookmark = async () => {
		try {
			setLoading(true);
			await bookmarkEvent(event.id);
			setIsLiked(true);
		} catch (error) {
			console.error("Failed to bookmark event:", error);
		} finally {
			setLoading(false);
		}
	};

	const getMediaType = (url: string) => {
		if (url.includes("/image/")) return "image";
		if (url.includes("/video/")) return "video";
		return "other";
	};

	return (
		<View style={styles.container}>
			{/* Header Content */}
			<View style={styles.headerContainer}>
				<TouchableOpacity
					onPress={() => router.push(`/organizer/${event.organizer.id}`)}
					style={styles.profileContainer}
				>
					{/* Organizer Image */}
					<Image
						source={{
							uri: event.organizer.profile.logo_url,
						}}
						style={styles.profileImage}
					/>
					<Text style={styles.nameText}>{event.organizer.profile.name}</Text>
				</TouchableOpacity>

				{/* Follow Button */}
				<View style={styles.actionContainer}>
					{!isFollowing && (
						<TouchableOpacity
							style={[styles.followButton, isFollowing && styles.followingButton]}
							onPress={handleFollow}
							disabled={loading || isFollowing}
						>
							<Text
								style={[
									styles.followButtonText,
									isFollowing && styles.followingButtonText,
								]}
							>
								Follow
							</Text>
						</TouchableOpacity>
					)}
					{isFollowing && (
						<View style={{ position: "relative" }}>
							<Ionicons
								size={15}
								name="ellipsis-vertical"
								onPress={() => setActionsShown((prev) => !prev)}
							/>
							{showActions && (
								<View
									style={{
										position: "absolute",
										top: 30,
										right: 0,
										width: 120,
										zIndex: 10,
										backgroundColor: "white",
										padding: 10,
										borderRadius: 4,
										// gap: 8,
										borderColor: "lightgray",
										borderWidth: 1,
									}}
								>
									<TouchableOpacity>
										<Text>View Page</Text>
									</TouchableOpacity>
									<View
										style={{
											height: 1,
											backgroundColor: "lightgray",
											marginVertical: 10,
										}}
									/>
									<TouchableOpacity
										style={{ borderColor: "black" }}
										onPress={handleUnfollow}
									>
										<Text>Unfollow</Text>
									</TouchableOpacity>
								</View>
							)}
						</View>
					)}
				</View>
			</View>

			{Array.isArray(event.cover_image_url) &&
				event.cover_image_url.length > 0 && (
					<PagerView style={styles.pager} initialPage={0} scrollEnabled={true}>
						{event.cover_image_url.map((url, index) => {
							const type = getMediaType(url);
							return (
								<View key={index} style={styles.imageContainer}>
									{type === "image" && (
										<Image source={{ uri: url }} style={styles.eventImage} />
									)}
									{/* {type === "video" && (
										<Video
											source={{ uri: url }}
											rate={1.0}
											volume={1.0}
											isMuted={false}
											resizeMode={ResizeMode.COVER}
											shouldPlay={true}
											isLooping={true}
											useNativeControls={false}
											style={styles.eventImage}
										/>
									)} */}
									{event.cover_image_url.length > 1 && (
										<View
											style={{
												position: "absolute",
												bottom: 10,
												right: 10,
												backgroundColor: "rgba(0, 0, 0, 0.5)",
												padding: 4,
												borderRadius: 4,
											}}
										>
											<Text style={{ color: "white" }}>
												{index + 1} / {event.cover_image_url.length}
											</Text>
										</View>
									)}
								</View>
							);
						})}
					</PagerView>
				)}

			{/* Footer Content */}
			<View style={styles.footerContainer}>
				<View style={styles.statsContainer}>
					{/* Like Button */}
					<TouchableOpacity
						style={styles.likeButton}
						onPress={() => {
							handleLike();
							event.liked = !event.liked;
							if (event.likes_count == undefined) return;
							if (event.liked) {
								event.likes_count += 1;
							} else {
								event.likes_count -= 1;
							}
						}}
						disabled={loading}
					>
						<Ionicons
							name={event.liked ? "heart" : "heart-outline"}
							size={30}
							color={event.liked ? "red" : "black"}
						/>
						{event.likes_count !== undefined &&
							event.likes_count !== null &&
							event.likes_count > 1 && (
								<Text style={styles.statText}>{event.likes_count}</Text>
							)}
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => {
							handleBookmark();
							event.bookmarked = !event.bookmarked;
							if (event.bookmarks_count == undefined) return;
							if (event.bookmarked) {
								event.bookmarks_count += 1;
							} else {
								event.bookmarks_count -= 1;
							}
						}}
						style={styles.statItem}
					>
						<Ionicons
							name={event.bookmarked ? "bookmark" : "bookmark-outline"}
							size={25}
							color="black"
						/>
						{/* <Ionicons name="bookmark-outline" size={20} color="black" /> */}
						{event.bookmarks_count !== undefined &&
							event.bookmarks_count !== null &&
							event.bookmarks_count > 1 && (
								<Text style={styles.statText}>{event.bookmarks_count}</Text>
							)}
					</TouchableOpacity>
				</View>

				<View
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						gap: 5,
					}}
				>
					<Ionicons name="calendar-outline" size={20} />
					<Text style={styles.dateText}>
						{new Date(event.start_date).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</Text>
				</View>
			</View>

			{/* Event Details */}
			<View style={styles.contentContainer}>
				<Text style={styles.title}>{event.title}</Text>
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

				{event.hashtags && (
					<View style={{ flexDirection: "row", gap: 6 }}>
						{event.hashtags.map((el) => {
							return (
								<TouchableOpacity key={el.name}>
									<Text style={styles.hashtags}>#{String(el.name || "")}</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				)}
			</View>
		</View>
	);
};

export default EventCard;

const styles = StyleSheet.create({
	container: {
		backgroundColor: "white",
		borderRadius: 8,
		marginBottom: 16,
		overflow: "hidden",
		// paddingHorizontal: 12,
	},
	pager: {
		width: "100%",
		height: 500,
		marginBottom: 10,
		position: "relative",
	},
	imageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	eventImage: {
		width: "100%",
		height: 500,
		resizeMode: "cover",
		// borderRadius: 8,
	},
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 10,
		paddingVertical: 8,
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
		color: "#374151",
	},
	actionContainer: {
		flexDirection: "row",
		alignItems: "center",
		// paddingHorizontal: 12,
	},
	followButton: {
		borderWidth: 1,
		borderColor: "#3B82F6",
		borderRadius: 8,
		paddingVertical: 4,
		paddingHorizontal: 12,
	},
	followingButton: {
		// backgroundColor: "#3B82F6",
		borderWidth: 0,
		paddingHorizontal: 5,
	},
	followButtonText: {
		color: "#3B82F6",
		fontWeight: "500",
	},
	followingButtonText: {
		color: "#3B82F6",
	},
	footerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: 8,
		paddingHorizontal: 12,
	},
	statsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
		// gap: 4,
	},
	statText: {
		fontSize: 14,
		marginLeft: 4,
	},
	dateText: {
		fontSize: 14,
	},
	contentContainer: {
		paddingVertical: 20,
		paddingHorizontal: 12,
	},
	title: {
		fontSize: 18,
		// fontWeight: "bold",
		fontFamily: "poppins",
	},
	description: {
		marginTop: 0,
		marginBottom: 12,
		height: 150,
		overflow: "hidden",
		opacity: 0.8,
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
	likeButton: {
		flexDirection: "row",
		alignItems: "center",
		// gap: 0,
	},
});
