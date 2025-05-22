import { z } from "zod";
import { userSchema } from "./auth.model";


// Main rating schema
export const RatingSchema = z.object({
    id: z.number(),
    user: userSchema,
    value: z.number().min(1).max(5, { message: "Rating must be between 1 and 5" }),
    comment: z.string(),
    created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" })
});

// Rating payload schema (for submitting a new rating)
export const RatingPayloadSchema = z.object({
    value: z.number().min(1).max(5, { message: "Rating must be between 1 and 5" }),
    comment: z.string().optional(),
    event_id: z.number()
});

export type Rating = z.infer<typeof RatingSchema>;
export type RatingPayload = z.infer<typeof RatingPayloadSchema>;
