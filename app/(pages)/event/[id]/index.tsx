import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Event } from "@/models/event.model";
import { useAuth } from "@/app/hooks/useAuth";
import {
	getEventById,
	getEventRatingsPaginated,
} from "@/actions/event.actions"; // <-- Add this import
import { TiptapRenderer } from "@/components/htmlRenderer";
import { useFocusEffect } from "@react-navigation/native";
import PagerView from "react-native-pager-view";
import { ResizeMode, Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import Loading from "@/app/components/Loading";
import { Rating } from "@/models/rating.model";

interface EventPageProps {
	event: Event;
}

const EventPage = () => {
	const [event, setEvent] = useState<Event | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [showRatings, setShowRatings] = useState(false);
	const [ratings, setRatings] = useState<Rating[]>([]);
	const [ratingsLoading, setRatingsLoading] = useState(false);
	const [ratingsError, setRatingsError] = useState<string | null>(null);
	const { tokens } = useAuth();
	const { id } = useLocalSearchParams();

	const fetchEvent = useCallback(async () => {
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
	}, [id, tokens]);

	// Fetch when id or tokens change
	useEffect(() => {
		if (id && tokens?.access) {
			fetchEvent();
		}
	}, [id, tokens, fetchEvent]);

	// Also fetch when the screen is focused (optional)
	useFocusEffect(
		useCallback(() => {
			if (id && tokens?.access) {
				fetchEvent();
			}
		}, [id, tokens, fetchEvent])
	);

	const getMediaType = (url: string) => {
		if (url.includes("/image/")) return "image";
		if (url.includes("/video/")) return "video";
		return "other";
	};

	const handleShowRatings = async () => {
		setShowRatings(true);
		setRatingsLoading(true);
		setRatingsError(null);
		try {
			const res = await getEventRatingsPaginated(event.id, 1, 20);
			setRatings(res.results);
		} catch (err) {
			setRatingsError("Failed to load ratings.");
		} finally {
			setRatingsLoading(false);
		}
	};

	if (isLoading || !event) {
		return <Loading />;
	}

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	const isEventPassed = new Date(event.end_date) < new Date();

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
		<SafeAreaView style={styles.container}>
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
				</View>
				{/* Move heroInformation below the image */}
				<View style={styles.heroInformation}>
					<Text style={[styles.title, { color: "black" }]}>{event.title}</Text>
					<View style={styles.infoTextContainer}>
						{/* <Ionicons name="location-outline" color="black" /> */}
						<Text style={[styles.infoText, { color: "black" }]}>
							{JSON.parse(event.location).name}
						</Text>
					</View>
					<View
						style={{
							display: "flex",
							alignItems: "flex-end",
							flexDirection: "row",
							gap: 15,
						}}
					>
						<View style={styles.infoTextContainer}>
							<Ionicons name="calendar" color="black" />
							<Text style={[styles.infoText, { color: "black" }]}>
								{new Date(event.start_date).toLocaleDateString()}
							</Text>
						</View>
						<View style={styles.infoTextContainer}>
							<Ionicons name="time-outline" color="black" />
							<Text style={[styles.infoText, { color: "black" }]}>
								{new Date(event.start_time).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
						</View>
					</View>
				</View>
				<View style={styles.infoContainer}>
					<Text style={styles.about}>About Event</Text>
					<TiptapRenderer htmlContent={event.description} />

					{event.has_attended && !event.rated && (
						<View style={styles.attendPromptContainer}>
							<Ionicons
								name="checkmark-circle"
								size={32}
								color="orange"
								style={{ marginBottom: 8 }}
							/>
							<Text style={styles.attendPromptTitle}>Thank you for attending!</Text>
							<Text style={styles.attendPromptText}>
								We noticed you attended this event. Would you like to share your
								experience?
							</Text>
							<TouchableOpacity
								style={styles.attendPromptButton}
								onPress={handleNavigateToRate}
							>
								<Ionicons
									name="star"
									size={18}
									color="#fff"
									style={{ marginRight: 6 }}
								/>
								<Text style={styles.attendPromptButtonText}>Rate the Event</Text>
							</TouchableOpacity>
						</View>
					)}
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
					{isEventPassed && (
						<TouchableOpacity
							style={[
								{
									backgroundColor: "#FFBB0A",
									position: "relative",
									marginTop: 16,
									flexDirection: "row",
									justifyContent: "center",
									alignItems: "center",
									padding: 12,
									borderRadius: 8,
									gap: 8,
								},
							]}
							onPress={handleShowRatings}
						>
							<Text style={[ { color: "#000" }]}>
								View All Ratings
							</Text>
							<Ionicons name="star" size={16} color="#000" />
						</TouchableOpacity>
					)}
				</View>

			</ScrollView>

			{/* Ratings Modal/Section */}
			{showRatings && (
				<View
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0,0,0,0.5)",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 100,
					}}
				>
					<View
						style={{
							backgroundColor: "#fff",
							borderRadius: 12,
							padding: 20,
							width: "90%",
							maxHeight: "80%",
						}}
					>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Text style={{ fontWeight: "bold", fontSize: 18 }}>Event Ratings</Text>
							<TouchableOpacity onPress={() => setShowRatings(false)}>
								<Ionicons name="close" size={24} color="#000" />
							</TouchableOpacity>
						</View>
						{ratingsLoading ? (
							<Text style={{ marginTop: 20 }}>Loading...</Text>
						) : ratingsError ? (
							<Text style={{ color: "red", marginTop: 20 }}>{ratingsError}</Text>
						) : ratings.length === 0 ? (
							<Text style={{ marginTop: 20 }}>No ratings yet.</Text>
						) : (
							<ScrollView style={{ marginTop: 16 }}>
								{ratings.map((rating, idx) => (
									<View
										key={rating.id || idx}
										style={{
											marginBottom: 18,
											borderBottomWidth: 1,
											borderBottomColor: "#eee",
											paddingBottom: 10,
										}}
									>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												marginBottom: 4,
											}}
										>
											<Ionicons name="person-circle" size={20} color="#888" />
											<Text style={{ marginLeft: 6, fontWeight: "bold" }}>
												{rating.user?.username || "User"}
											</Text>
										</View>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												marginBottom: 2,
											}}
										>
											{[1, 2, 3, 4, 5].map((star) => (
												<Ionicons
													key={star}
													name={star <= rating.value ? "star" : "star-outline"}
													size={16}
													color="#FFBB0A"
												/>
											))}
											<Text style={{ marginLeft: 8, color: "#444" }}>
												{rating.value}/5
											</Text>
										</View>
										{rating.comment ? (
											<Text style={{ color: "#444", fontStyle: "italic" }}>
												{rating.comment}
											</Text>
										) : null}
										<Text style={{ color: "#aaa", fontSize: 12, marginTop: 2 }}>
											{new Date(rating.created_at).toLocaleDateString()}
										</Text>
									</View>
								))}
							</ScrollView>
						)}
					</View>
				</View>
			)}

			{!isEventPassed && !event.has_attended && event.has_ticket && (
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.push(`/ticket/${event.id}`)}
				>
					<Text style={styles.buttonText}>Buy Another Tickets</Text>
				</TouchableOpacity>
			)}
			{!isEventPassed && !event.has_attended && !event.has_ticket && (
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.push(`/ticket/${event.id}`)}
				>
					<Text style={styles.buttonText}>Buy Tickets</Text>
				</TouchableOpacity>
			)}
			{!isEventPassed && event.has_attended && (
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.push(`/ticket/${event.id}`)}
				>
					<Text style={styles.buttonText}>Buy Another Tickets</Text>
				</TouchableOpacity>
			)}
			{/* {event.has_attended && !event.rated && (
				<TouchableOpacity style={styles.rateButton} onPress={handleNavigateToRate}>
					<Ionicons name="star" size={15} color="#000000" />
					<Text style={styles.rateButtonText}>Rate this event</Text>
				</TouchableOpacity>
			)} */}
		</SafeAreaView>
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
		fontSize: 14,
		color: "white",
	},
	infoTextContainer: {
		flexDirection: "row",
		gap: 4,
		alignItems: "center",
		marginBottom: 10,
	},
	about: {
		fontWeight: "bold",
		marginTop: 5,
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
		// position: "absolute",
		// bottom: 0,
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
		// borderTopColor: "#E5E7EB",
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
	attendPromptContainer: {
		backgroundColor: "#FFF7ED", // light orange background
		borderRadius: 14,
		padding: 20,
		marginTop: 20,
		marginBottom: 10,
		alignItems: "center",
		shadowColor: "#FF9800",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 3,
	},
	attendPromptTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 4,
	},
	attendPromptText: {
		fontSize: 15,
		textAlign: "center",
		marginBottom: 14,
	},
	attendPromptButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FF9800",
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 8,
		marginTop: 4,
	},
	attendPromptButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
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
