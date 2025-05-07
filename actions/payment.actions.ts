import axios from "axios";
import { PaymentResponse, PaymentResponseSchema } from "@/models/payment.model";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to initialize a payment
 * @param ticketId - The ID of the ticket to initialize payment for
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to the payment initialization response
 * @throws Error if the API request fails or the response is invalid
 */
export const paymentInit = async (ticketId: number, accessToken: string): Promise<PaymentResponse> => {
    try {
        if (!accessToken) {
            throw new Error("Access token is missing. Please log in again.");
        }

        const response = await axios.post(
            `${BASE_URL}/payment/initiate/`,
            { ticket_id: ticketId },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Validate the response using the PaymentResponseSchema
        const validatedResponse = PaymentResponseSchema.parse(response.data);

        console.log("Payment initialized successfully:", validatedResponse);
        return validatedResponse;
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