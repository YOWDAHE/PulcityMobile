import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createRating, getUserRating, updateRating } from "@/actions/rating.actions";
import { getEventById } from "@/actions/event.actions";
import { Event } from "@/models/event.model";
import { Rating } from "@/models/rating.model";
import HeaderComponent from "@/components/HeaderComponent";

const RatingScreen = () => {
	const { id } = useLocalSearchParams();
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [existingRating, setExistingRating] = useState<Rating | null>(null);
	const [event, setEvent] = useState<Event | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				setError(null);

				if (!id) {
					throw new Error("Event ID is missing");
				}

				// Fetch event details
				const eventDetails = await getEventById(Number(id));
				setEvent(eventDetails);

				// Check if user has already rated this event
				const userRating = await getUserRating(Number(id));
				if (userRating) {
					setExistingRating(userRating);
					setRating(userRating.value);
					setComment(userRating.comment);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
				console.error("Error fetching data:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [id]);

	const handleSubmit = async () => {
		try {
			if (rating === 0) {
				Alert.alert("Error", "Please select a rating before submitting");
				return;
			}

			setIsSubmitting(true);
			
			const ratingPayload = {
				value: rating,
				comment,
				event_id: Number(id),
			};
			
			if (existingRating) {
				// Update existing rating
				await updateRating(ratingPayload);
				Alert.alert("Success", "Your rating has been updated successfully", [
					{
						text: "OK",
						onPress: () => router.back(),
					},
				]);
			} else {
				// Create new rating
				await createRating(ratingPayload);
				Alert.alert("Success", "Your rating has been submitted successfully", [
					{
						text: "OK",
						onPress: () => router.back(),
					},
				]);
			}
		} catch (err) {
			console.error("Error submitting rating:", err);
			Alert.alert(
				"Error",
				`There was an error ${existingRating ? 'updating' : 'submitting'} your rating. Please try again.`
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStars = () => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<TouchableOpacity
					key={i}
					onPress={() => setRating(i)}
					style={styles.starContainer}
				>
					<Ionicons
						name={i <= rating ? "star" : "star-outline"}
						size={40}
						color="#FFBB0A"
					/>
				</TouchableOpacity>
			);
		}
		return stars;
	};

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#FFBB0A" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity style={styles.button} onPress={() => router.back()}>
					<Text style={styles.buttonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<HeaderComponent
				title={existingRating ? "Edit Your Rating" : "Rate This Event"}
				onBack={() => router.back()}
			/>

			<ScrollView contentContainerStyle={styles.content}>
				{event && (
					<View style={styles.eventInfo}>
						<Text style={styles.eventTitle}>{event.title}</Text>
						<Text style={styles.eventDate}>
							{new Date(event.start_date).toLocaleDateString()}
						</Text>
					</View>
				)}

				<Text style={styles.label}>How would you rate this event?</Text>

				<View style={styles.starsContainer}>{renderStars()}</View>

				<Text style={styles.ratingText}>
					{rating === 0 ? "Tap a star to rate" : `${rating} out of 5 stars`}
				</Text>

				<Text style={styles.label}>Share your experience (optional)</Text>
				<TextInput
					style={styles.commentInput}
					multiline
					placeholder="Write your review here..."
					value={comment}
					onChangeText={setComment}
					textAlignVertical="top"
				/>

				<TouchableOpacity
					style={[styles.submitButton, isSubmitting && styles.disabledButton]}
					onPress={handleSubmit}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<ActivityIndicator size="small" color="#FFFFFF" />
					) : (
						<Text style={styles.submitButtonText}>
							{existingRating ? "Update Rating" : "Submit Rating"}
						</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
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
		padding: 20,
	},
	errorText: {
		color: "#FF3B30",
		fontSize: 16,
		textAlign: "center",
		marginBottom: 20,
	},
	content: {
		padding: 20,
	},
	eventInfo: {
		marginBottom: 24,
		padding: 16,
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: "#FFBB0A",
	},
	eventTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1F2937",
		marginBottom: 8,
	},
	eventDate: {
		color: "#6B7280",
		fontSize: 14,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#374151",
		marginBottom: 12,
		textAlign: "center",
	},
	starsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 12,
	},
	starContainer: {
		padding: 8,
	},
	ratingText: {
		textAlign: "center",
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 24,
	},
	commentInput: {
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		height: 150,
		backgroundColor: "#F9FAFB",
		marginBottom: 24,
	},
	submitButton: {
		backgroundColor: "#FFBB0A",
		borderRadius: 8,
		padding: 16,
		alignItems: "center",
	},
	disabledButton: {
		backgroundColor: "#FCD34D",
	},
	submitButtonText: {
		color: "#000000",
		fontSize: 16,
		fontWeight: "600",
	},
	button: {
		backgroundColor: "#FFBB0A",
		borderRadius: 8,
		padding: 12,
		alignItems: "center",
	},
	buttonText: {
		color: "#000000",
		fontSize: 14,
		fontWeight: "600",
	},
});

export default RatingScreen;
