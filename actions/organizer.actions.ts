import { Event } from "@/models/event.model";
import { Organizer, OrganizerPageInterface } from "@/models/organizer.model";
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";


/**
 * Function to fetch an organizer by their ID
 * @param organizerId - The ID of the organizer to fetch
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to the organizer's data
 * @throws Error if the API request fails or the response is invalid
 */
export const getOrganizerById = async (organizerId: number): Promise<any> => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/organizations/${organizerId}/`);

        console.log("Fetched organizer successfully:", response.data);
        return response.data;
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
 * Function to follow an organizer by their ID
 * @param organizerId - The ID of the organizer to follow
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to the follow response
 * @throws Error if the API request fails or the response is invalid
 */
export const followOrganizer = async (organizerId: number): Promise<any> => {
    try {
        const response = await axiosInstance.post(
            `/organizations/${organizerId}/follow/`,
        );

        console.log("Followed organizer successfully:", response.data);
        return response.data;
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

export const unfollowOrganizer = async (organizerId: number): Promise<any> => {
    try {

        const response = await axiosInstance.post(
            `${BASE_URL}/organizations/${organizerId}/unfollow/`,
        );

        console.log("Followed organizer successfully:", response.data);
        return response.data;
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

export const getOrganizerPageDetail = async (organizerId: number): Promise<OrganizerPageInterface> => {
    try {

        const events = await axiosInstance.get(
            `/organizations/${organizerId}/events/`,
        );
        const organizer = await axiosInstance.get(
            `/organizations/${organizerId}/`,
        );
        const followers = await axiosInstance.get(
            `/organizations/${organizerId}/followers/`,
        );

        return {
            eventCount: events.data.count,
            events: events.data.results,
            followerCount: followers.data.count,
            organization: organizer.data
        };
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