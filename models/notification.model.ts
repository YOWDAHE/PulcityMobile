import { z } from "zod";
import { OrganizerSchema } from "./organizer.model";
import { EventSchema } from "./event.model";


export const getNotificationResponseSchema = z.object({
    id: z.number(),
    user: z.number(),
    event: EventSchema,
    message: z.string().nullable(),
    read: z.boolean(),
    created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    sent_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
});

export type notificationResponse = z.infer<typeof getNotificationResponseSchema>;