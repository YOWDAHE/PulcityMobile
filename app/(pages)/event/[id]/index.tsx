import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Event } from "@/models/event.model";
import { useAuth } from "@/app/hooks/useAuth";
import { getEventById } from "@/actions/event.actions";
import { TiptapRenderer } from "@/components/htmlRenderer";
import { useFocusEffect } from "@react-navigation/native";
import PagerView from "react-native-pager-view";
import { ResizeMode, Video } from "expo-av";

interface EventPageProps {
	event: Event;
}

const EventPage = () => {
	const [event, setEvent] = useState<Event | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const { tokens } = useAuth();
	const { id } = useLocalSearchParams();

	useFocusEffect(
		React.useCallback(() => {
			console.log("Event ID:", id);
			const fetchEvent = async () => {
				try {
					if (!tokens?.access) {
						throw new Error("Access token is required to fetch the event");
					}

					if (!id) {
						throw new Error("Event ID is missing in the route parameters");
					}

					setIsLoading(true);
					const fetchedEvent = await getEventById(Number(id));
					setEvent(fetchedEvent);
					setError("");
				} catch (err) {
					setError(err instanceof Error ? err.message : "An error occurred");
				} finally {
					setIsLoading(false);
				}
			};

			fetchEvent();
		}, [id, tokens])
	);

	const getMediaType = (url: string) => {
		if (url.includes("/image/")) return "image";
		if (url.includes("/video/")) return "video";
		return "other";
	};

	if (isLoading || !event) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	const isEventPassed = new Date(event.start_date) < new Date();

	const getEventRating = (event: Event): number | null => {
		if (!event.rating) return null;

		if (typeof event.rating === "number") return event.rating;

		if (typeof event.rating === "object" && "value" in event.rating) {
			return event.rating.value;
		}

		return null;
	};

	const getRatingComment = (event: Event): string | null => {
		if (
			!event.rating ||
			typeof event.rating !== "object" ||
			!("comment" in event.rating)
		) {
			return null;
		}
		return event.rating.comment;
	};

	const handleNavigateToRate = () => {
		router.push({
			pathname: "/rate/[id]",
			params: { id: event.id },
		});
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.hero}>
					<PagerView style={styles.pager} initialPage={0} scrollEnabled={true}>
						{event.cover_image_url.map((url, index) => {
							const type = getMediaType(url);
							return (
								<View key={index} style={styles.imageContainer}>
									{type === "image" && (
										<Image source={{ uri: url }} style={styles.image} />
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
											style={styles.image}
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
					<View style={styles.heroInformation}>
						<Text style={styles.title}>{event.title}</Text>
						<View
							style={{
								display: "flex",
								// justifyContent: "space-between",
								alignItems: "flex-end",
								flexDirection: "row",
								gap: 15,
							}}
						>
							<View style={styles.infoTextContainer}>
								<Ionicons name="calendar" color="white" />
								<Text style={styles.infoText}>
									{new Date(event.start_date).toLocaleDateString()}
								</Text>
							</View>
							<View style={styles.infoTextContainer}>
								<Ionicons name="time-outline" color="white" />
								<Text style={styles.infoText}>
									{new Date(event.start_time).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</Text>
							</View>
						</View>
						<View style={styles.infoTextContainer}>
							<Ionicons name="location-outline" color="white" />
							<Text style={styles.infoText}>{JSON.parse(event.location).name}</Text>
						</View>
					</View>
				</View>
				<View style={styles.infoContainer}>
					<Text style={styles.about}>About Event</Text>
					<TiptapRenderer htmlContent={event.description} />
					{event.rated && (
						<View style={styles.ratingSection}>
							<View style={styles.ratingHeader}>
								<Text style={styles.ratingLabel}>Your Rating</Text>
								<TouchableOpacity
									style={styles.updateRatingButton}
									onPress={handleNavigateToRate}
								>
									<Ionicons name="create-outline" size={16} color="#3B82F6" />
									<Text style={styles.updateRatingText}>Update</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.ratingContent}>
								<View style={styles.starsContainer}>
									{[1, 2, 3, 4, 5].map((star) => (
										<Ionicons
											key={star}
											name={star <= (getEventRating(event) || 0) ? "star" : "star-outline"}
											size={24}
											color="#FFBB0A"
											style={styles.starIcon}
										/>
									))}
									<Text style={styles.ratingValue}>{getEventRating(event)}/5</Text>
								</View>
								{getRatingComment(event) && (
									<View style={styles.commentContainer}>
										<Text style={styles.commentLabel}>Your comment:</Text>
										<Text style={styles.commentText}>{getRatingComment(event)}</Text>
									</View>
								)}
							</View>
						</View>
					)}
				</View>
			</ScrollView>
			
			{!isEventPassed && (
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.push(`/ticket/${event.id}`)}
				>
					<Text style={styles.buttonText}>Buy Tickets</Text>
				</TouchableOpacity>
			)}
			{event.has_attended && !event.rated && (
				<TouchableOpacity style={styles.rateButton} onPress={handleNavigateToRate}>
					<Ionicons name="star" size={15} color="#000000" />
					<Text style={styles.rateButtonText}>Rate this event</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	scrollContent: {
		paddingBottom: 80,
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
	image: {
		width: "100%",
		height: "100%",
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 5,
		borderBottomLeftRadius: 5,
	},
	infoContainer: {
		paddingHorizontal: 16,
		marginTop: 8,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
		paddingBottom: 8,
	},
	infoText: {
		fontSize: 12,
		color: "white",
	},
	infoTextContainer: {
		flexDirection: "row",
		gap: 4,
		alignItems: "center",
		// marginTop: 10,
	},
	about: {
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 10,
	},
	description: {
		marginTop: 8,
	},
	whoIsComing: {
		fontWeight: "bold",
		marginTop: 28,
		marginBottom: 10,
	},
	guests: {
		marginTop: 8,
	},
	button: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "#00b4dd",
		padding: 16,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	rateButton: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "orange",
		padding: 16,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		gap: 10,
	},
	rateButtonText: {
		color: "black",
		fontSize: 16,
		fontWeight: "bold",
	},
	hero: {
		position: "relative",
		paddingHorizontal: 10,
		borderRadius: 10,
	},
	heroInformation: {
		position: "absolute",
		bottom: 0,
		padding: 20,
		paddingHorizontal: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	errorText: {
		color: "red",
		fontSize: 16,
		textAlign: "center",
	},
	ratingSection: {
		marginTop: 24,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		paddingTop: 16,
	},
	ratingHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	ratingLabel: {
		fontSize: 18,
		fontWeight: "bold",
	},
	updateRatingButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 8,
		borderRadius: 6,
		backgroundColor: "#EBF5FF",
		gap: 4,
	},
	updateRatingText: {
		color: "#3B82F6",
		fontWeight: "500",
		fontSize: 14,
	},
	ratingContent: {
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
		padding: 16,
	},
	starsContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	starIcon: {
		marginRight: 4,
	},
	ratingValue: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: "600",
	},
	commentContainer: {
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		paddingTop: 12,
	},
	commentLabel: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 4,
	},
	commentText: {
		fontSize: 14,
		fontStyle: "italic",
		color: "#4B5563",
	},
});

export default EventPage;
