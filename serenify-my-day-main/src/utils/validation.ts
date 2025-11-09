import { z } from 'zod';

// Password validation schema
export const passwordSchema = z.string()
  .min(12, { message: "Password must be at least 12 characters" })
  .refine(password => /[A-Z]/.test(password), { message: "Password must include at least one uppercase letter" })
  .refine(password => /[a-z]/.test(password), { message: "Password must include at least one lowercase letter" })
  .refine(password => /\d/.test(password), { message: "Password must include at least one number" })
  .refine(password => /[!@#$%^&*(),.?":{}|<>]/.test(password), { message: "Password must include at least one special character" });

// Email validation schema
export const emailSchema = z.string().email({ message: "Invalid email address" });

// Journal entry validation schema
export const journalSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .regex(/^[a-zA-Z0-9\s\-_.,!?'"]+$/, "Title contains invalid characters"),
  content: z.string()
    .min(1, "Content is required")
    .max(10000, "Content must be 10,000 characters or less"),
  mood_value: z.number().int().min(1).max(5),
});

// Mood tracking validation schema
export const moodSchema = z.object({
    mood_value: z.number().int().min(1).max(5),
    notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});
