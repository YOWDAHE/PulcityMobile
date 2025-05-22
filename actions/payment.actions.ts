import axios from "axios";
import { PaymentResponse, PaymentResponseSchema } from "@/models/payment.model";
import axiosInstance from "@/utils/axiosInstance";
import { TicketPayload } from "@/models/ticket.model";

const BASE_URL = "https://www.mindahun.pro.et/api/v1";

/**
 * Function to initialize a payment
 * @param ticketId - The ID of the ticket to initialize payment for
 * @param accessToken - The access token for authentication
 * @returns Promise resolving to the payment initialization response
 * @throws Error if the API request fails or the response is invalid
 */
export const paymentInit = async (ticketPayload: TicketPayload): Promise<PaymentResponse> => {
    try {
        const response = await axiosInstance.post(
            `/payment/initiate/`,
            ticketPayload,
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