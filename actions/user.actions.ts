import axios, { AxiosResponse } from "axios";
import { Organizer } from "@/models/organizer.model";
import { getFollowingResponse } from "@/models/user.modal";
import axiosInstance from "@/utils/axiosInstance";
import { Event } from "@/models/event.model";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to fetch the list of organizers the user is following
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to an array of organizers
 * @throws Error if the API request fails or the response is invalid
 */
export const fetchFollowingOrganizers = async (accessToken: string): Promise<Organizer[]> => {
    try {
        if (!accessToken) {
            throw new Error("Access token is required to fetch the following organizers");
        }

        const response: AxiosResponse<getFollowingResponse> = await axios.get(`${BASE_URL}/users/me/following/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log("Fetched following organizers successfully:", response.data);
        return response.data.results as Organizer[];
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


export const fetchSavedEvent = async (): Promise<Event[]> => {
    try {

        const response = await axiosInstance.get(`/users/me/bookmarks/`);

        console.log("Fetched following organizers successfully:", response.data);
        return response.data.results as Event[];
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

