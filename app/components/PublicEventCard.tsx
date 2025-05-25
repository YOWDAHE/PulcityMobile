import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    Touchable,
    Modal,
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
import { navigateToHashtagSearch } from "@/app/utils/hashtagUtils";

interface EventCardProps {
    event: Event;
    showDots?: boolean;
}

const PublicEventCard = ({ event, showDots = true }: EventCardProps) => {
    const [showActions, setActionsShown] = useState(false);
    const [isFollowing, setIsFollowing] = useState(
        event.organizer.profile.is_following
    );
    const [isLiked, setIsLiked] = useState(event.liked);
    const [loading, setLoading] = useState(false);

    const [showAuthPopup, setShowAuthPopup] = useState(false);

    const getMediaType = (url: string) => {
        if (url.includes("/image/")) return "image";
        if (url.includes("/video/")) return "video";
        return "other";
    };

    const getEventRating = (event: Event): number | null => {
        if (!event.rating) return null;

        if (typeof event.rating === "number") return event.rating;

        if (typeof event.rating === "object" && "value" in event.rating) {
            return event.rating.value;
        }

        return null;
    };

    console.log(event.organizer.profile.logo_url);

    // Handler for all actions on public page
    const handlePublicAction = () => {
        setShowAuthPopup(true);
    };

    return (
					<View style={styles.container}>
						{/* Header Content */}
						<View style={styles.headerContainer}>
							<TouchableOpacity
								onPress={() => handlePublicAction()}
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
								<TouchableOpacity
									style={[styles.followButton, isFollowing && styles.followingButton]}
									onPress={handlePublicAction}
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
												{type === "video" && (
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
												)}
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
									onPress={handlePublicAction}
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

								<TouchableOpacity onPress={handlePublicAction} style={styles.statItem}>
									<Ionicons
										name={event.bookmarked ? "bookmark" : "bookmark-outline"}
										size={24}
										color="black"
									/>
								</TouchableOpacity>

								{event.rated && (
									<View style={styles.statItem}>
										<Ionicons name="star" size={20} color="#FFBB0A" />
										<Text style={styles.statText}>{getEventRating(event)}</Text>
									</View>
								)}
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
							<Pressable onPress={() => handlePublicAction()}>
								<View style={styles.description}>
									<TiptapRenderer htmlContent={event.description} />
									<Text>... more</Text>
								</View>
							</Pressable>

							{event.hashtags && (
								<View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
									{event.hashtags.map((el) => {
										return (
											<TouchableOpacity key={el.name} onPress={() => handlePublicAction()}>
												<Text style={styles.hashtags}>#{String(el.name || "")}</Text>
											</TouchableOpacity>
										);
									})}
								</View>
							)}
						</View>

						{/* Auth Popup Modal */}
						<Modal
							visible={showAuthPopup}
							transparent
							animationType="fade"
							onRequestClose={() => setShowAuthPopup(false)}
						>
							<View
								style={{
									flex: 1,
									backgroundColor: "rgba(0,0,0,0.4)",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<View
									style={{
										backgroundColor: "#fff",
										padding: 28,
										borderRadius: 16,
										alignItems: "center",
										width: 300,
										shadowColor: "#000",
										shadowOffset: { width: 0, height: 2 },
										shadowOpacity: 0.15,
										shadowRadius: 8,
										elevation: 5,
									}}
								>
									<Ionicons
										name="lock-closed-outline"
										size={40}
										color="#00b4dd"
										style={{ marginBottom: 12 }}
									/>
									<Text
										style={{
											fontSize: 18,
											fontWeight: "bold",
											marginBottom: 8,
											textAlign: "center",
										}}
									>
										Sign up or Login to interact with events
									</Text>
									<Text style={{ color: "#666", marginBottom: 18, textAlign: "center" }}>
										You need an account to like, follow, bookmark, or get tickets for
										events.
									</Text>
									<View style={{ flexDirection: "row", gap: 12 }}>
										<TouchableOpacity
											style={{
												backgroundColor: "#00b4dd",
												paddingHorizontal: 24,
												paddingVertical: 10,
												borderRadius: 8,
												marginRight: 8,
											}}
											onPress={() => {
												setShowAuthPopup(false);
												router.push("/(auth)/signUp");
											}}
										>
											<Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
												Sign Up
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={{
												backgroundColor: "#fff",
												borderWidth: 1,
												borderColor: "#00b4dd",
												paddingHorizontal: 24,
												paddingVertical: 10,
												borderRadius: 8,
											}}
											onPress={() => {
												setShowAuthPopup(false);
												router.push("/(auth)/login");
											}}
										>
											<Text style={{ color: "#00b4dd", fontWeight: "bold", fontSize: 16 }}>
												Login
											</Text>
										</TouchableOpacity>
									</View>
									<TouchableOpacity
										style={{ marginTop: 18 }}
										onPress={() => setShowAuthPopup(false)}
									>
										<Text style={{ color: "#888" }}>Cancel</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Modal>
					</View>
				);
};

export default PublicEventCard;

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
        paddingVertical: 10,
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
    rateButton: {
        backgroundColor: "#FFBB0A",
        borderColor: "#FFBB0A",
    },
    rateButtonText: {
        color: "#000000",
    },
});
