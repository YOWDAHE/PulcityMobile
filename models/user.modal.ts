import { z } from "zod";
import { OrganizerSchema } from "./organizer.model";


export const getFollowingResponseSchema = z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(OrganizerSchema),
});

export type getFollowingResponse = z.infer<typeof getFollowingResponseSchema>;