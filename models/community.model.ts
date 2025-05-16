import { z } from "zod";
import { EventSchema } from "./event.model";

export const CommunitySchema = z.object({
    id: z.number(),
    event: EventSchema,
    name: z.string(),
    description: z.string(),
    created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
});

export type Community = z.infer<typeof CommunitySchema>;