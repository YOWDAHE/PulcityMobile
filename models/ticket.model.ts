import { z } from "zod";

export const TicketSchema = z.object({
    id: z.number(),
    event: z.number(),
    name: z.string(),
    description: z.string(),
    price: z.string().regex(/^-?\d+(\.\d+)?$/, { message: "Invalid price format" }),
    valid_from: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    valid_until: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
    updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
});

export const ticketPayload = z.object({
    tickets: z.array(
        z.object({
            ticket_id: z.number(),
            quantity: z.number(),
        })
    )
})

export const userTicket = z.object({
    id: z.number(),
    ticket: TicketSchema,
    used: z.boolean(),
    purchase_date: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
})

export type Ticket = z.infer<typeof TicketSchema>;
export type TicketPayload = z.infer<typeof ticketPayload>;
export type UserTicket = z.infer<typeof userTicket>;
