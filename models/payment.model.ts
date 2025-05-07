import { z } from "zod";

export const PaymentResponseSchema = z.object({
    detail: z.object({
        message: z.string(),
        status: z.string(),
        data: z.object({
            checkout_url: z.string().url({ message: "Invalid URL format" }),
        }),
    }),
    tx_ref: z.string(),
});

export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;