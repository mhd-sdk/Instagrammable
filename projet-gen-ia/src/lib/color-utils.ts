/**
 * Color Utility Functions
 * Provides color manipulation, harmony generation, and accessibility checking
 */

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

// Convert hex to HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return rgbToHex(r * 255, g * 255, b * 255);
}

// Calculate relative luminance for contrast ratio
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Check WCAG accessibility level
export function getAccessibilityLevel(
  contrastRatio: number
): "AAA" | "AA" | "AA Large" | "Fail" {
  if (contrastRatio >= 7) return "AAA";
  if (contrastRatio >= 4.5) return "AA";
  if (contrastRatio >= 3) return "AA Large";
  return "Fail";
}

// Generate complementary color
export function getComplementary(hex: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
}

// Generate analogous colors (colors adjacent on the color wheel)
export function getAnalogous(hex: string): [string, string, string] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex, hex, hex];
  return [
    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    hex,
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
  ];
}

// Generate triadic colors (three colors equally spaced on the color wheel)
export function getTriadic(hex: string): [string, string, string] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex, hex, hex];
  return [
    hex,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

// Generate split-complementary colors
export function getSplitComplementary(hex: string): [string, string, string] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex, hex, hex];
  return [
    hex,
    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
  ];
}

// Generate shades (darker variations)
export function getShades(hex: string, count: number = 5): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return Array(count).fill(hex);

  const shades: string[] = [];
  const step = hsl.l / (count + 1);

  for (let i = 1; i <= count; i++) {
    shades.push(hslToHex(hsl.h, hsl.s, hsl.l - step * i));
  }

  return shades;
}

// Generate tints (lighter variations)
export function getTints(hex: string, count: number = 5): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return Array(count).fill(hex);

  const tints: string[] = [];
  const step = (100 - hsl.l) / (count + 1);

  for (let i = 1; i <= count; i++) {
    tints.push(hslToHex(hsl.h, hsl.s, hsl.l + step * i));
  }

  return tints;
}

// Determine if a color is light or dark
export function isLightColor(hex: string): boolean {
  const luminance = getLuminance(hex);
  return luminance > 0.179;
}

// Get optimal text color for a background
export function getTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? "#000000" : "#FFFFFF";
}

// Validate hex color format
export function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// Color palette presets organized by category
export interface ColorPalette {
  id: string;
  name: string;
  category: string;
  primary: string;
  secondary: string;
  accent: string;
}

export const paletteCategories = [
  "Professional",
  "Nature",
  "Vibrant",
  "Pastel",
  "Dark",
  "Neutral",
] as const;

export type PaletteCategory = (typeof paletteCategories)[number];

export const colorPalettes: ColorPalette[] = [
  // Professional
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    category: "Professional",
    primary: "#1E40AF",
    secondary: "#3B82F6",
    accent: "#DBEAFE",
  },
  {
    id: "modern-slate",
    name: "Modern Slate",
    category: "Professional",
    primary: "#475569",
    secondary: "#94A3B8",
    accent: "#F1F5F9",
  },
  {
    id: "executive",
    name: "Executive",
    category: "Professional",
    primary: "#1F2937",
    secondary: "#6B7280",
    accent: "#F9FAFB",
  },
  // Nature
  {
    id: "forest-green",
    name: "Forest",
    category: "Nature",
    primary: "#166534",
    secondary: "#22C55E",
    accent: "#DCFCE7",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    category: "Nature",
    primary: "#0369A1",
    secondary: "#38BDF8",
    accent: "#E0F2FE",
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    category: "Nature",
    primary: "#EA580C",
    secondary: "#FB923C",
    accent: "#FFF7ED",
  },
  {
    id: "earth-tones",
    name: "Earth Tones",
    category: "Nature",
    primary: "#78350F",
    secondary: "#D97706",
    accent: "#FFFBEB",
  },
  // Vibrant
  {
    id: "electric-purple",
    name: "Electric Purple",
    category: "Vibrant",
    primary: "#7C3AED",
    secondary: "#A78BFA",
    accent: "#EDE9FE",
  },
  {
    id: "hot-pink",
    name: "Hot Pink",
    category: "Vibrant",
    primary: "#DB2777",
    secondary: "#F472B6",
    accent: "#FCE7F3",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    category: "Vibrant",
    primary: "#06B6D4",
    secondary: "#22D3EE",
    accent: "#CFFAFE",
  },
  {
    id: "ruby-red",
    name: "Ruby Red",
    category: "Vibrant",
    primary: "#DC2626",
    secondary: "#F87171",
    accent: "#FEE2E2",
  },
  // Pastel
  {
    id: "soft-lavender",
    name: "Soft Lavender",
    category: "Pastel",
    primary: "#A855F7",
    secondary: "#D8B4FE",
    accent: "#FAF5FF",
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    category: "Pastel",
    primary: "#10B981",
    secondary: "#6EE7B7",
    accent: "#ECFDF5",
  },
  {
    id: "peach-cream",
    name: "Peach Cream",
    category: "Pastel",
    primary: "#F97316",
    secondary: "#FDBA74",
    accent: "#FFF7ED",
  },
  {
    id: "sky-blue",
    name: "Sky Blue",
    category: "Pastel",
    primary: "#0EA5E9",
    secondary: "#7DD3FC",
    accent: "#F0F9FF",
  },
  // Dark
  {
    id: "midnight",
    name: "Midnight",
    category: "Dark",
    primary: "#1E1B4B",
    secondary: "#312E81",
    accent: "#4338CA",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    category: "Dark",
    primary: "#171717",
    secondary: "#404040",
    accent: "#737373",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    category: "Dark",
    primary: "#0C4A6E",
    secondary: "#075985",
    accent: "#0284C7",
  },
  // Neutral
  {
    id: "warm-gray",
    name: "Warm Gray",
    category: "Neutral",
    primary: "#57534E",
    secondary: "#A8A29E",
    accent: "#F5F5F4",
  },
  {
    id: "cool-gray",
    name: "Cool Gray",
    category: "Neutral",
    primary: "#52525B",
    secondary: "#A1A1AA",
    accent: "#FAFAFA",
  },
  {
    id: "stone",
    name: "Stone",
    category: "Neutral",
    primary: "#44403C",
    secondary: "#78716C",
    accent: "#F5F5F4",
  },
];

// Get palettes by category
export function getPalettesByCategory(category: PaletteCategory): ColorPalette[] {
  return colorPalettes.filter((p) => p.category === category);
}

// Generate a palette from a single color
export function generatePaletteFromColor(primaryHex: string): ColorPalette {
  const hsl = hexToHsl(primaryHex);
  if (!hsl) {
    return {
      id: "custom",
      name: "Custom",
      category: "Custom",
      primary: primaryHex,
      secondary: primaryHex,
      accent: "#FFFFFF",
    };
  }

  // Secondary: lighter version with slightly reduced saturation
  const secondaryL = Math.min(hsl.l + 20, 85);
  const secondaryS = Math.max(hsl.s - 10, 30);
  const secondary = hslToHex(hsl.h, secondaryS, secondaryL);

  // Accent: very light version
  const accentL = Math.min(hsl.l + 45, 98);
  const accentS = Math.max(hsl.s - 60, 10);
  const accent = hslToHex(hsl.h, accentS, accentL);

  return {
    id: "generated",
    name: "Generated",
    category: "Custom",
    primary: primaryHex,
    secondary,
    accent,
  };
}
