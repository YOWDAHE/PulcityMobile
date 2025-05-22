import axios, { AxiosResponse } from "axios";
import { Organizer } from "@/models/organizer.model";
import { getFollowingResponse } from "@/models/user.modal";
import { notificationResponse } from "@/models/notification.model";
import axiosInstance from "@/utils/axiosInstance";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to fetch the notifications for a user
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to an array of notification
 * @throws Error if the API request fails or the response is invalid
 */
export const fetchNotifications = async (): Promise<notificationResponse[]> => {
    try {
        const response: AxiosResponse<notificationResponse[]> = await axiosInstance.get(`/notifications/`);

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
 * Function to mark a notification as read
 * @param notificationId - The ID of the notification to mark as read
 * @returns Promise resolving to the updated notification data
 * @throws Error if the API request fails or the response is invalid
 */
export const markNotificationAsRead = async (notificationId: number): Promise<any> => {
    try {
        const response = await axiosInstance.post(`/notifications/${notificationId}/read/`);
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
 * Function to mark all notifications as read
 * @returns Promise resolving to the success response
 * @throws Error if the API request fails or the response is invalid
 */
export const markAllNotificationsAsRead = async (): Promise<any> => {
    try {
        const response = await axiosInstance.post(`/notifications/read-all/`);
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