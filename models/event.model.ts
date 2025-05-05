import { z } from "zod";
import { SocialMediaLinksSchema, OrganizersSchema } from "./organizer.model";

export const OrganizerProfileSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    logo_url: z.string().url({ message: "Invalid URL format" }),
    contact_phone: z.string(),
    website_url: z.string().url({ message: "Invalid URL format" }),
    social_media_links: SocialMediaLinksSchema,
    created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    user: z.number(),
});

export const OrganizerSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    role: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    is_active: z.boolean(),
    date_joined: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    username: z.string(),
    profile: OrganizerProfileSchema,
});

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
    cover_image_url: z.string().url({ message: "Invalid URL format" }),
    is_public: z.boolean(),
    created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
});

export type Event = z.infer<typeof EventSchema>;