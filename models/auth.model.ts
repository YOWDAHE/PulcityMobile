import { z } from "zod";

// User Sign-Up Schema
export const userSignUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().regex(/^\w+$/, { message: "Invalid username format" }),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// User Profile Schema
export const userProfileSchema = z.object({
  id: z.number(),
  bio: z.string().optional(),
  user: z.number(),
});

// User Schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  is_active: z.boolean(),
  date_joined: z.string(),
  username: z.string(),
  profile: userProfileSchema,
});

// User Response Schema
export const userResponseSchema = z.object({
  message: z.string(),
  user: userSchema,
});

// User Login Response Schema
export const userLoginResponseSchema = z.object({
  tokens: z.object({
    property1: z.string().nullable(),
    property2: z.string().nullable(),
  }),
  user: z.object({
    id: z.number(),
    email: z.string().email(),
    role: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    is_active: z.boolean(),
    date_joined: z.string(),
    username: z.string(),
    profile: z.string(),
  }),
});

export interface VerifiedUser {
  message: string;
  tokens: Tokens;
  user: User;
}

export interface Tokens {
  refresh: string;
  access: string;
}

// TypeScript Types
export type User = z.infer<typeof userSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserSignUp = z.infer<typeof userSignUpSchema>;
export type UserLoginResponse = z.infer<typeof userLoginResponseSchema>;