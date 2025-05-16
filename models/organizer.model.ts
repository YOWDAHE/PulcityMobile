import { z } from "zod";
import { Event } from "./event.model";

// Social Media Links Schema
export const SocialMediaLinksSchema = z.object({
    twitter: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
    facebook: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
    instagram: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
});

// Organizer Profile Schema
export const OrganizerProfileSchema = z.object({
    id: z.number(),
    is_following: z.boolean(),
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

// Organizer Schema
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

export interface OrganizerPageInterface {
    eventCount: number;
    events: Event[];
    followerCount: number;
    organization: Organizer;
}

// Export inferred types
export type SocialMediaLinks = z.infer<typeof SocialMediaLinksSchema>;
export type OrganizerProfile = z.infer<typeof OrganizerProfileSchema>;
export type Organizer = z.infer<typeof OrganizerSchema>;
