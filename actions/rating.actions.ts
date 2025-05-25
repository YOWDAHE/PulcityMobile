import axios from "axios";
import { Rating, RatingPayload, RatingSchema } from "@/models/rating.model";
import axiosInstance from "@/utils/axiosInstance";

/**
 * Function to rate an event
 * @param ratingPayload - The rating payload containing value, comment, and event_id
 * @returns Promise resolving to the created rating
 * @throws Error if the API request fails or the response is invalid
 */
export const createRating = async (ratingPayload: RatingPayload): Promise<Rating> => {
    try {
        const response = await axiosInstance.post(
            `/events/${ratingPayload.event_id}/rating/`,
            {
                value: ratingPayload.value,
                comment: ratingPayload.comment || ""
            }
        );

        // Validate the response
        const validatedResponse = RatingSchema.parse(response.data);
        console.log("Rating created successfully:", validatedResponse);
        return validatedResponse;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrors = error.response.data;
            console.error("API validation errors:", apiErrors);
            throw new Error(JSON.stringify(apiErrors));
        } else if (error instanceof Error) {
            console.error("Validation or runtime error:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw error;
        }
    }
};

/**
 * Function to get ratings for an event
 * @param eventId - The ID of the event to get ratings for
 * @returns Promise resolving to an array of ratings
 * @throws Error if the API request fails or the response is invalid
 */
export const getEventRatings = async (eventId: number): Promise<Rating[]> => {
    try {
        const response = await axiosInstance.get(`/events/${eventId}/rating/`);
        
        // Validate each rating in the response
        const ratings = response.data.results.map((rating: any) => RatingSchema.parse(rating));
        console.log(`Fetched ${ratings.length} ratings for event ${eventId}`);
        return ratings;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrors = error.response.data;
            console.error("API validation errors:", apiErrors);
            throw new Error(JSON.stringify(apiErrors));
        } else if (error instanceof Error) {
            console.error("Validation or runtime error:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw error;
        }
    }
};

/**
 * Function to get a user's rating for an event
 * @param eventId - The ID of the event
 * @returns Promise resolving to the user's rating or null if not rated
 * @throws Error if the API request fails or the response is invalid
 */
export const getUserRating = async (eventId: number): Promise<Rating | null> => {
    try {
        const response = await axiosInstance.get(`/events/${eventId}/rating/me/`);
        
        if (!response.data) {
            return null;
        }
        
        // Validate the response
        const validatedResponse = RatingSchema.parse(response.data);
        return validatedResponse;
    } catch (error) {
        // If 404, it means user hasn't rated yet
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null;
        }
        
        if (axios.isAxiosError(error) && error.response) {
            const apiErrors = error.response.data;
            console.error("API validation errors:", apiErrors);
            throw new Error(JSON.stringify(apiErrors));
        } else if (error instanceof Error) {
            console.error("Validation or runtime error:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw error;
        }
    }
}; 

/**
 * Function to update an existing rating
 * @param ratingPayload - The updated rating payload with value, comment, and event_id
 * @returns Promise resolving to the updated rating
 * @throws Error if the API request fails or the response is invalid
 */
export const updateRating = async (ratingPayload: RatingPayload): Promise<Rating> => {
    try {
        const response = await axiosInstance.put(
            `/events/${ratingPayload.event_id}/rating/me/`,
            {
                value: ratingPayload.value,
                comment: ratingPayload.comment || ""
            }
        );

        // Validate the response
        const validatedResponse = RatingSchema.parse(response.data);
        console.log("Rating updated successfully:", validatedResponse);
        return validatedResponse;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrors = error.response.data;
            console.error("API validation errors:", apiErrors);
            throw new Error(JSON.stringify(apiErrors));
        } else if (error instanceof Error) {
            console.error("Validation or runtime error:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw error;
        }
    }
}; 

/**
 * Function to get all ratings submitted by the current user
 * @returns Promise resolving to an array of ratings with event details
 * @throws Error if the API request fails or the response is invalid
 */
export const getUserReviews = async (): Promise<any[]> => {
    try {
        const response = await axiosInstance.get('/users/ratings/');
        const ratedEvents = response.data.results || [];
        console.log(`Fetched ${ratedEvents.length} user-rated events`);
        return ratedEvents;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrors = error.response.data;
            console.error("API validation errors:", apiErrors);
            throw new Error(JSON.stringify(apiErrors));
        } else if (error instanceof Error) {
            console.error("Validation or runtime error:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw error;
        }
    }
}; 

/**
 * Function to delete a user's rating for an event
 * @param eventId - The ID of the event
 * @returns Promise resolving to void
 * @throws Error if the API request fails
 */
export const deleteRating = async (eventId: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/events/${eventId}/rating/me/`);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrors = error.response.data;
            console.error("API validation errors:", apiErrors);
            throw new Error(JSON.stringify(apiErrors));
        } else if (error instanceof Error) {
            console.error("Validation or runtime error:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw error;
        }
    }
};