import axios from "axios";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to fetch an organizer by their ID
 * @param organizerId - The ID of the organizer to fetch
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to the organizer's data
 * @throws Error if the API request fails or the response is invalid
 */
export const getOrganizerById = async (organizerId: number, accessToken: string): Promise<any> => {
    try {
        if (!accessToken) {
            throw new Error("Access token is required to fetch the organizer");
        }

        const response = await axios.get(`${BASE_URL}/organizations/${organizerId}/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

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