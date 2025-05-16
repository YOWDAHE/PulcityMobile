import axios, { AxiosResponse } from "axios";
import { Organizer } from "@/models/organizer.model";
import { getFollowingResponse } from "@/models/user.modal";
import { notificationResponse } from "@/models/notification.model";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to fetch the notifications for a user
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to an array of notification
 * @throws Error if the API request fails or the response is invalid
 */
export const fetchNotifications = async (accessToken: string): Promise<notificationResponse[]> => {
    try {
        if (!accessToken) {
            throw new Error("Access token is required to fetch the following organizers");
        }

        const response: AxiosResponse<notificationResponse[]> = await axios.get(`${BASE_URL}/notifications/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

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