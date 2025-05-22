import axios from "axios";
import { userSignUpSchema, UserSignUp, userResponseSchema, UserResponse, VerifiedUser, Tokens } from "../models/auth.model";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";
// const BASE_URL = process.env.BASE_URL;

export interface ErrorType {
    email: string[];
    username: string[];
    password: string[];
}

/**
 * Function to sign up a new user
 * @param data - User sign-up data
 * @returns Promise resolving to the user response
 * @throws Error if validation fails or API request fails
 */
export const signUp = async (data: UserSignUp): Promise<UserResponse | ErrorType> => {
    try {
        console.log("SignUp data:", data);
        // userSignUpSchema.parse(data);

        const response: UserResponse | ErrorType = await axios.post(`${BASE_URL}/auth/register/`, data);

        if ("data" in response) {
            const validatedResponse = userResponseSchema.parse(response.data);
            console.log("User registered successfully:", validatedResponse);
            return validatedResponse;
        } else {
            console.error("API validation errors:", response);
            return response as ErrorType;
        }
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
 * Function to verify email
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the VerifiedUser response
 * @throws Error if validation fails or API request fails
 */
export const verifyEmail = async (email: string, otp: string): Promise<VerifiedUser> => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/email/verify/`, { email, otp });

        const verifiedUser: VerifiedUser = response.data;
        console.log("Email verified successfully:", verifiedUser);

        return verifiedUser;
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
 * Function to log in a user
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to the VerifiedUser response
 * @throws Error if validation fails or API request fails
 */
export const login = async (email: string, password: string): Promise<VerifiedUser> => {

    const response = await axios.post(`${BASE_URL}/auth/login/`, { email, password });

    if (response.data && response.data.user) {
        console.log("OTP resent successfully:", response.data.message);
        return response.data as VerifiedUser;
    } else {
        throw new Error("Unexpected response format");
    }
};

/**
 * Function to resend OTP
 * @param email - User's email address
 * @returns Promise resolving to a success message
 * @throws Error if validation fails or API request fails
 */
export const resendOtp = async (email: string): Promise<string> => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/otp/resend/`, { email });

        if (response.data && response.data.message) {
            console.log("OTP resent successfully:", response.data.message);
            return response.data.message;
        } else {
            throw new Error("Unexpected response format");
        }
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
 * Function to refresh the access token using the refresh token
 * @param refresh - The refresh token
 * @returns Promise resolving to void
 * @throws Error if the API request fails or the response is invalid
 */
export async function refreshToken(refresh: string): Promise<Tokens> {
    try {
        const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh,
        });

        if (response.data && response.data.access && response.data.refresh) {
            console.log('New tokens:', response.data);

            return {
                access: response.data.access,
                refresh: response.data.refresh,
            };
        } else {
            throw new Error('Invalid response format: Missing access or refresh token.');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
}

interface ProfileUpdateData {
    bio?: string;
    profile_photo_url?: string | null;
    phone_number?: string | null;
    date_of_birth?: string | null;
    location?: string | null;
    interests?: any | null;
}

/**
 * Function to partially update the authenticated user's profile
 * @param data - Profile data to update
 * @returns Promise resolving to the updated profile data
 * @throws Error if the API request fails
 */
export const updateUserProfile = async (data: ProfileUpdateData): Promise<ProfileUpdateData> => {
    try {
        const response = await axios.patch(`${BASE_URL}/users/profile/`, data);

        if (response.data) {
            console.log('Profile updated successfully:', response.data);
            return response.data;
        } else {
            throw new Error('Invalid response format: Missing profile data');
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrors = error.response.data;
            console.error("API validation errors:", apiErrors);
            throw new Error(JSON.stringify(apiErrors));
        } else if (error instanceof Error) {
            console.error("Runtime error:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw new Error('An unexpected error occurred while updating profile');
        }
    }
};