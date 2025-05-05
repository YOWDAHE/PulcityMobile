import axios from "axios";
import { z } from "zod";
import { EventSchema, Event } from "../models/event.model";
import { useAuth } from "@/app/hooks/useAuth";
import { getServerAuth } from "@/app/hooks/useServerAuth";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to fetch events
 * @returns Promise resolving to an array of Events
 * @throws Error if the API request fails or the response is invalid
 */
export const getEvents = async (accessToken: string): Promise<Event[]> => {
    try {
        if (!accessToken) {
            throw new Error("Access token is missing. Please log in again.");
        }

        const response = await axios.get(`${BASE_URL}/events/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const events = z.array(EventSchema).parse(response.data);

        console.log("Fetched events successfully:", events);
        return events;
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
 * Function to fetch a single event by its ID
 * @param eventId - The ID of the event to fetch
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to the Event object
 * @throws Error if the API request fails or the response is invalid
 */
export const getEventById = async (eventId: number, accessToken: string): Promise<Event> => {
    try {
        if (!accessToken) {
            throw new Error("Access token is missing. Please log in again.");
        }

        const response = await axios.get(`${BASE_URL}/events/${eventId}/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const event = EventSchema.parse(response.data);

        console.log("Fetched event successfully:", event);
        return event;
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