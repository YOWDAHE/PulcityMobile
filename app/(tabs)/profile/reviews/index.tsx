import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import ReviewCard from "@/app/components/profile/_components/ReviewCard";
import { getUserReviews } from "@/actions/rating.actions";
import { Event } from "@/app/components/profile/constants/types";

// Define the type for the API response of rated events
interface RatingData {
  id: number;
  value: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface EventData {
  id: number;
  title: string;
  cover_image_url: string[];
  organizer: {
    profile: {
      name: string;
      logo_url: string;
    }
  };
  start_date: string;
  end_date: string;
  attendee_count: number;
  likes_count: number;
  liked: boolean;
  bookmarked: boolean;
  rating: {
    id: number;
    value: number;
    comment: string;
    created_at: string;
    updated_at: string;
  };
  // other event properties
}

interface UserRatingResponse {
  id: number;
  event: EventData;
  value: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: UserRatingResponse[];
}

export default function ReviewsTab() {
    const [reviews, setReviews] = useState<UserRatingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setIsLoading(true);
                const response = await getUserReviews() as ApiResponse | UserRatingResponse[];
                
                if (Array.isArray(response)) {
                    setReviews(response);
                } else if (response && 'results' in response) {
                    setReviews(response.results);
                } else {
                    setReviews([]);
                }
                
                setError(null);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Failed to load your reviews. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={reviews.length === 0 ? styles.centered : undefined}>
            {reviews.length === 0 ? (
                <Text style={styles.emptyText}>You haven't reviewed any events yet.</Text>
            ) : (
                reviews.map((review) => (
                    <ReviewCard 
                        key={review.id} 
                        // Keep the existing event prop for backward compatibility
                        event={{
                            id: String(review.event.id),
                            title: review.event.title,
                            organizer: review.event.organizer?.profile?.name || "Organizer",
                            date: new Date(review.event.start_date).toLocaleDateString(),
                            action: "",
                            review: review.comment || "",
                            rating: review.value || 0,
                            attendees: `${review.event.attendee_count || 0} people attended`
                        }}
                        // Pass the new rating and eventDetails props
                        rating={{
                            id: review.id,
                            value: review.value,
                            comment: review.comment,
                            created_at: review.created_at,
                            updated_at: review.updated_at
                        }}
                        eventDetails={{
                            id: review.event.id,
                            title: review.event.title,
                            cover_image_url: review.event.cover_image_url,
                            organizer: review.event.organizer,
                            start_date: review.event.start_date,
                            attendee_count: review.event.attendee_count,
                            liked: review.event.liked,
                            likes_count: review.event.likes_count
                        }}
                    />
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "white",
    },
    centered: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "#EF4444",
        textAlign: "center",
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
    }
});