import { Ticket } from "@/models/ticket.model";
import axios from "axios";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to fetch a single ticket by its ID
 * @param ticketId - The ID of the ticket to fetch
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to the ticket object
 * @throws Error if the API request fails or the response is invalid
 */
export const getTicketById = async (ticketId: number, accessToken: string): Promise<Ticket> => {
    try {
        if (!accessToken) {
            throw new Error("Access token is missing. Please log in again.");
        }

        const response = await axios.get(`${BASE_URL}/tickets/${ticketId}/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log("Fetched ticket successfully:", response.data);
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