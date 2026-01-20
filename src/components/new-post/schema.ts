import { z } from "zod";

// Form validation schema
export const newPostSchema = z.object({
  title: z
    .string()
    .max(200, "Title must be under 200 characters")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().min(1, "Please upload an image"),
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(2000, "Prompt must be under 2000 characters"),
});

// TypeScript type from schema
export type NewPostFormData = z.infer<typeof newPostSchema>;

// Default form values
export const defaultValues: NewPostFormData = {
  title: "",
  imageUrl: "",
  prompt: "",
};
