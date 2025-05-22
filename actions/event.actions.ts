import axios from "axios";
import { z } from "zod";
import { EventSchema, Event } from "../models/event.model";
import { useAuth } from "@/app/hooks/useAuth";
import { getServerAuth } from "@/app/hooks/useServerAuth";
import axiosInstance from "@/utils/axiosInstance";
import { NumberArray } from "react-native-svg";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to fetch events
 * @returns Promise resolving to an array of Events
 * @throws Error if the API request fails or the response is invalid
 */
export const getEvents = async (): Promise<Event[]> => {
    try {
        console.log("Fetching...")

        const response = await axiosInstance.get(`/events/`);

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
export const getEventById = async (eventId: number): Promise<Event> => {
    try {

        const response = await axiosInstance.get(`/events/${eventId}/`);

        const event = EventSchema.parse(response.data);

        // console.log("Fetched event successfully:", event);
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

/**
 * Function to like an event by its ID
 * @param eventId - The ID of the event to like
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to the like response
 * @throws Error if the API request fails or the response is invalid
 */
export const likeEvent = async (eventId: NumberArray): Promise<any> => {
    try {

        const response = await axiosInstance.post(
            `/events/${eventId}/like/`,
        );

        console.log("Liked event successfully:", response.data);
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
 * Function to bookmark an event by its ID
 * @param eventId - The ID of the event to bookmark
 * @returns void
 * @throws Error if the API request fails or the response is invalid
 */
export const bookmarkEvent = async (eventId: NumberArray): Promise<any> => {
    try {

        const response = await axiosInstance.post(
            `/events/${eventId}/bookmark/`,
        );

        console.log("Liked event successfully:", response.data);
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
 * Fetches popular events from the API
 * @returns Promise resolving to an array of popular events
 * @throws Error if the API request fails or validation fails
 */
export const getPopularEvents = async (): Promise<Event[]> => {
  try {
      const response = await axiosInstance.get('/events/filter/popular/');
      console.log(response.data.results)
      const events = response.data.results.map((event: unknown) => EventSchema.parse(event));
    
    return events;
  } catch (error) {
    console.error('Error fetching popular events:', error);
    throw error;
  }
};

/**
 * Fetches events from organizers that the user follows
 * @returns Promise resolving to an array of events from followed organizers
 * @throws Error if the API request fails or validation fails
 */
export const getFollowedEvents = async (): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get('/events/filter/following/');
    
    // Validate the response data against the schema
      const events = z.array(EventSchema).parse(response.data.results);
    
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
 * Fetches upcoming events for the authenticated user
 * @returns Promise resolving to an array of upcoming events
 * @throws Error if the API request fails or validation fails
 */
export const getUpcomingEvents = async (): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get('/events/upcoming/');
    
    // Validate the response data against the schema
      const events = z.array(EventSchema).parse(response.data.results);
    
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

interface SearchEventParams {
  q?: string;
  category?: string;
  hashtags?: string;
}

/**
 * Search for events by keywords, categories, and hashtags
 * @param params - Search parameters including query, categories, and hashtags
 * @returns Promise resolving to an array of matching events
 * @throws Error if the API request fails or validation fails
 */
export const searchEvents = async (params: SearchEventParams): Promise<Event[]> => {
    try {
      
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.hashtags) queryParams.append('hashtags', params.hashtags);

    const response = await axiosInstance.get(`/events/search/?${queryParams.toString()}`);
    
    const events = z.array(EventSchema).parse(response.data.results);
    
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

interface NearbyEventsParams {
  lat: number;
  lng: number;
  radius?: number;
}

/**
 * Fetches events near a specific location
 * @param params - Location parameters including latitude, longitude, and optional radius in kilometers
 * @returns Promise resolving to an array of nearby events
 * @throws Error if the API request fails or validation fails
 */
export const getNearbyEvents = async (params: NearbyEventsParams): Promise<Event[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('lat', params.lat.toString());
    queryParams.append('lng', params.lng.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());

    const response = await axiosInstance.get(`/events/filter/nearby/?${queryParams.toString()}`);
    
    // Validate the response data against the schema
    const events = z.array(EventSchema).parse(response.data);
    
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
 * Fetches all events the authenticated user has attended
 * @returns Promise resolving to an array of attended events
 * @throws Error if the API request fails or validation fails
 */
export const getAttendedEvents = async (): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get('/events/attended/');
    
    // Extract results array from response
    const attendedEvents = response.data.results || [];
    
    // Validate the response data against the schema if needed
    const events = z.array(EventSchema).parse(attendedEvents);
    
    return attendedEvents;
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