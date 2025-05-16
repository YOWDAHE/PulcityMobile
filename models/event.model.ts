import { z } from "zod";
import { OrganizerSchema, SocialMediaLinksSchema } from "./organizer.model";


export const EventSchema = z.object({
    id: z.number(),
    organizer: OrganizerSchema,
    category: z.array(z.number()),
    title: z.string(),
    description: z.string(),
    start_time: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    end_time: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    start_date: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    end_date: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    location: z.string(),
    latitude: z.number().min(-90).max(90, { message: "Latitude must be between -90 and 90" }),
    longitude: z.number().min(-180).max(180, { message: "Longitude must be between -180 and 180" }),
    cover_image_url: z.array(z.string().url({ message: "Invalid URL format" })),
    is_public: z.boolean(),
    likes_count: z.number().int().nonnegative({ message: "Likes count must be a non-negative integer" }).optional(),
    liked: z.boolean().optional(),
    bookmarks_count: z.number().int().nonnegative({ message: "Likes count must be a non-negative integer" }).optional(),
    bookmarked: z.boolean().optional(),
    hashtags: z.array(z.object({name: z.string()})),
    created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
});

export type Event = z.infer<typeof EventSchema>;