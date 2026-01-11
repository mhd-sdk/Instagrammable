import { z } from "zod";

export const promptBuilderSchema = z.object({
  // Configuration name
  configName: z.string().min(1, "Please enter a name for your brand identity").max(100, "Name must be under 100 characters"),

  // Logo section
  logo: z.string().optional(),
  logoFile: z.instanceof(File).optional(),

  // Color section
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF5733)"),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),

  // Artistic direction section
  style: z.string().min(1, "Please select a style"),
  mood: z.string().min(1, "Please select a mood"),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),

  // Custom instructions
  customInstructions: z.string().max(2000, "Instructions must be under 2000 characters").optional(),
});

export type PromptBuilderFormData = z.infer<typeof promptBuilderSchema>;

export const defaultValues: PromptBuilderFormData = {
  configName: "",
  logo: "",
  primaryColor: "#6366F1",
  secondaryColor: "",
  accentColor: "",
  style: "",
  mood: "",
  industry: "",
  targetAudience: "",
  customInstructions: "",
};

export const styleOptions = [
  { value: "modern", label: "Modern & Minimalist" },
  { value: "classic", label: "Classic & Elegant" },
  { value: "playful", label: "Playful & Fun" },
  { value: "bold", label: "Bold & Dynamic" },
  { value: "organic", label: "Organic & Natural" },
  { value: "tech", label: "Tech & Futuristic" },
  { value: "vintage", label: "Vintage & Retro" },
  { value: "luxury", label: "Luxury & Premium" },
];

export const moodOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly & Approachable" },
  { value: "energetic", label: "Energetic & Exciting" },
  { value: "calm", label: "Calm & Serene" },
  { value: "trustworthy", label: "Trustworthy & Reliable" },
  { value: "innovative", label: "Innovative & Creative" },
  { value: "sophisticated", label: "Sophisticated & Refined" },
  { value: "warm", label: "Warm & Inviting" },
];

export const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & Banking" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "food", label: "Food & Beverage" },
  { value: "travel", label: "Travel & Hospitality" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "real-estate", label: "Real Estate" },
  { value: "entertainment", label: "Entertainment & Media" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "other", label: "Other" },
];
