import { Ticket, UserTicket } from "@/models/ticket.model";
import axiosInstance from "@/utils/axiosInstance";
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

/**
 * Function to fetch all tickets bought by the current user
 * @returns Promise resolving to an array of UserTicket objects
 * @throws Error if the API request fails or the response is invalid
 */
export const getBoughtTickets = async (): Promise<Ticket[]> => {
    try {
        const response = await axiosInstance.get('/tickets/bought/');
        
        return response.data.results || [];
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
 * Function to fetch tickets by event ID
 * @param eventId - The ID of the event to fetch tickets for
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to an array of tickets
 * @throws Error if the API request fails or the response is invalid
 */
export const getBoughtTicketsByEventId = async (eventId: number): Promise<UserTicket[]> => {
    try {

        const response = await axiosInstance.get(`/events/${eventId}/user/tickets/`);

        // console.log("Fetched tickets successfully:", response.data);
        return response.data.results;
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
 * Function to fetch user tickets by event ID
 * @param eventId - The ID of the event to fetch user tickets for
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to an array of tickets
 * @throws Error if the API request fails or the response is invalid
 */
export const getTicketsByEventId = async (eventId: number): Promise<Ticket[]> => {
    try {

        const response = await axiosInstance.get(`/events/${eventId}/tickets/`);

        console.log("Fetched user tickets successfully:", response.data);
        return response.data.tickets;
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