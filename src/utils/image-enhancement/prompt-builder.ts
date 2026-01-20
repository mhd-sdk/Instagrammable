/**
 * Prompt Builder for Image Enhancement
 * Builds dynamic prompts based on brand identity configuration
 */

import type {
  BrandIdentity,
  PromptGenerationConfig,
  VariationFocus,
  VariationPrompt,
  EnhancementMode,
} from "./types";

/**
 * Build a color description from a color palette
 */
function buildColorDescription(colorPalette: BrandIdentity["colorPalette"]): string {
  if (!colorPalette) return "";

  const colors: string[] = [];

  if (colorPalette.primaryColor) {
    colors.push(`Primary color: ${colorPalette.primaryColor}`);
  }
  if (colorPalette.secondaryColor) {
    colors.push(`Secondary color: ${colorPalette.secondaryColor}`);
  }
  if (colorPalette.accentColor) {
    colors.push(`Accent color: ${colorPalette.accentColor}`);
  }
  if (colorPalette.backgroundColor) {
    colors.push(`Background color: ${colorPalette.backgroundColor}`);
  }
  if (colorPalette.textColor) {
    colors.push(`Text color: ${colorPalette.textColor}`);
  }

  if (colors.length === 0) return "";

  return `Brand Color Palette (${colorPalette.name}):\n${colors.join("\n")}`;
}

/**
 * Build an artistic direction description
 */
function buildArtisticDescription(
  artisticDirection: BrandIdentity["artisticDirection"]
): string {
  if (!artisticDirection) return "";

  const parts: string[] = [];

  parts.push(`Style: ${artisticDirection.style}`);

  if (artisticDirection.tone) {
    parts.push(`Tone: ${artisticDirection.tone}`);
  }

  if (artisticDirection.keywords) {
    parts.push(`Keywords: ${artisticDirection.keywords}`);
  }

  if (artisticDirection.description) {
    parts.push(`Description: ${artisticDirection.description}`);
  }

  return `Artistic Direction (${artisticDirection.name}):\n${parts.join("\n")}`;
}

/**
 * Build logo reference description
 */
function buildLogoDescription(logo: BrandIdentity["logo"]): string {
  if (!logo) return "";

  return `Brand Logo: "${logo.name}" - Consider incorporating brand logo elements and visual identity markers when suggesting enhancements.`;
}

/**
 * Build custom template instructions
 */
function buildTemplateInstructions(template: BrandIdentity["template"]): string {
  if (!template) return "";

  let instructions = `Custom Template (${template.name}):\n${template.content}`;

  if (template.category) {
    instructions += `\nCategory: ${template.category}`;
  }

  return instructions;
}

/**
 * Get enhancement intensity modifier based on mode
 */
function getEnhancementIntensity(mode: EnhancementMode): string {
  switch (mode) {
    case "subtle":
      return "Make minimal, refined adjustments that preserve the original image's essence while subtly incorporating brand elements. Keep changes understated and elegant.";
    case "moderate":
      return "Apply balanced enhancements that clearly reflect the brand identity while maintaining the product's core visual appeal. Blend original elements with brand styling.";
    case "creative":
      return "Create bold, artistic interpretations that strongly express the brand identity. Feel free to suggest dramatic transformations and creative reinterpretations.";
    default:
      return "Apply balanced enhancements that reflect the brand identity while maintaining visual appeal.";
  }
}

/**
 * Get focus-specific instructions
 */
function getFocusInstructions(focus: VariationFocus): string {
  switch (focus) {
    case "color-harmony":
      return `
FOCUS: Color Harmony Enhancement
- Primary emphasis on color palette integration
- Suggest background color modifications that complement the brand palette
- Recommend color grading and tonal adjustments
- Consider color temperature and saturation aligned with brand colors
- Propose accent color placements and highlights`;

    case "style-expression":
      return `
FOCUS: Artistic Style Expression
- Emphasize the brand's artistic style and tone
- Suggest compositional changes that reflect the style direction
- Recommend texture, pattern, or visual effect treatments
- Consider lighting styles that match the brand tone
- Propose styling elements that express brand personality`;

    case "brand-integration":
      return `
FOCUS: Brand Integration
- Prioritize cohesive brand element integration
- Suggest placement ideas for brand visual elements
- Recommend ways to incorporate brand identity markers
- Consider how to make the product feel "on-brand"
- Propose subtle brand reinforcement techniques`;

    case "mood-atmosphere":
      return `
FOCUS: Mood & Atmosphere
- Create specific emotional atmosphere aligned with brand
- Suggest lighting and shadow treatments for mood
- Recommend environmental elements that enhance atmosphere
- Consider color temperature for emotional impact
- Propose ambient effects that support brand feeling`;

    case "balanced":
    default:
      return `
FOCUS: Balanced Brand Enhancement
- Harmoniously combine all brand elements
- Balance color, style, and mood considerations
- Integrate brand identity naturally
- Create cohesive overall enhancement
- Ensure all elements work together seamlessly`;
  }
}

/**
 * Build the complete brand context section
 */
function buildBrandContext(brandIdentity: BrandIdentity): string {
  const sections: string[] = [];

  const colorDesc = buildColorDescription(brandIdentity.colorPalette);
  if (colorDesc) sections.push(colorDesc);

  const artisticDesc = buildArtisticDescription(brandIdentity.artisticDirection);
  if (artisticDesc) sections.push(artisticDesc);

  const logoDesc = buildLogoDescription(brandIdentity.logo);
  if (logoDesc) sections.push(logoDesc);

  const templateInst = buildTemplateInstructions(brandIdentity.template);
  if (templateInst) sections.push(templateInst);

  if (sections.length === 0) {
    return "No specific brand identity defined. Use general best practices for product image enhancement.";
  }

  return `=== BRAND IDENTITY ===\n\n${sections.join("\n\n")}`;
}

/**
 * Build a prompt for a specific variation
 */
export function buildVariationPrompt(config: PromptGenerationConfig): VariationPrompt {
  const brandContext = buildBrandContext(config.brandIdentity);
  const focusInstructions = getFocusInstructions(config.variationFocus);
  const intensityGuidance = getEnhancementIntensity(config.enhancementMode);

  const systemContext = `You are an expert brand designer and image enhancement specialist. Your task is to analyze a product image and suggest personalized enhancement variations based on the brand identity provided.

${brandContext}

${focusInstructions}

ENHANCEMENT INTENSITY:
${intensityGuidance}

${config.customInstructions ? `CUSTOM INSTRUCTIONS:\n${config.customInstructions}` : ""}`;

  const prompt = `Analyze this product image and create a detailed enhancement concept for a "${config.variationFocus}" focused variation.

You must provide your response in the following JSON format:
{
  "title": "Short descriptive title for this variation (max 50 chars)",
  "concept": "Detailed explanation of the enhancement concept (2-3 sentences)",
  "visualElements": ["Array of 3-5 specific visual elements to include or modify"],
  "colorSuggestions": ["Array of 3-5 color recommendations based on brand palette"],
  "moodDescription": "Description of the mood and atmosphere this variation creates",
  "stylingNotes": "Specific styling and technical recommendations for implementation",
  "promptDescription": "A detailed prompt that could be used with an image generation AI to recreate this variation (be very specific and detailed)"
}

Ensure your suggestions are:
1. Directly aligned with the brand identity provided
2. Practical and implementable
3. Specific and actionable
4. Enhancing the product's appeal while maintaining brand consistency

Respond with valid JSON only, no additional text.`;

  return {
    focus: config.variationFocus,
    prompt,
    systemContext,
  };
}

/**
 * Build prompts for multiple variations with different focuses
 */
export function buildVariationPrompts(
  brandIdentity: BrandIdentity,
  customInstructions: string | undefined,
  enhancementMode: EnhancementMode,
  variationCount: number,
  primaryFocus?: VariationFocus
): VariationPrompt[] {
  const allFocuses: VariationFocus[] = [
    "color-harmony",
    "style-expression",
    "brand-integration",
    "mood-atmosphere",
    "balanced",
  ];

  // If primary focus specified, start with it
  let focuses: VariationFocus[];
  if (primaryFocus && primaryFocus !== "balanced") {
    focuses = [primaryFocus];
    // Add other focuses, excluding the primary one
    const otherFocuses = allFocuses.filter((f) => f !== primaryFocus);
    focuses = [...focuses, ...otherFocuses];
  } else {
    focuses = allFocuses;
  }

  // Limit to requested count
  focuses = focuses.slice(0, Math.min(variationCount, 5));

  return focuses.map((focus) =>
    buildVariationPrompt({
      brandIdentity,
      customInstructions,
      variationFocus: focus,
      enhancementMode,
    })
  );
}

/**
 * Build an image analysis prompt
 */
export function buildAnalysisPrompt(): string {
  return `Analyze this product image and provide a brief summary (2-3 sentences) describing:
1. What the product is
2. Key visual characteristics (colors, composition, lighting)
3. Current styling and mood

Keep your response concise and factual.`;
}

/**
 * Parse a variation response from the AI
 */
export function parseVariationResponse(
  rawResponse: string,
  focus: VariationFocus
): Omit<import("./types").ImageVariation, "id" | "rawResponse"> | null {
  try {
    // Try to extract JSON from the response
    let jsonString = rawResponse.trim();

    // If the response contains markdown code blocks, extract the JSON
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonString);

    return {
      focus,
      title: parsed.title || "Untitled Variation",
      concept: parsed.concept || "",
      visualElements: Array.isArray(parsed.visualElements) ? parsed.visualElements : [],
      colorSuggestions: Array.isArray(parsed.colorSuggestions)
        ? parsed.colorSuggestions
        : [],
      moodDescription: parsed.moodDescription || "",
      stylingNotes: parsed.stylingNotes || "",
      promptDescription: parsed.promptDescription || "",
    };
  } catch {
    // If parsing fails, return null
    return null;
  }
}
