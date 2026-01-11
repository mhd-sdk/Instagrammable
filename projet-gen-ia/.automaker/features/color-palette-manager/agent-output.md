
🔧 Tool: Task
Input: {
  "description": "Explore codebase structure",
  "prompt": "I need to implement a color palette manager UI component for selecting and managing brand colors with color picker, palette presets, and color visualization. The selections should be stored in prompt configuration.\n\nPlease explore the codebase to understand:\n1. The overall project structure (what framework is used - React, Vue, etc.)\n2. Where UI components are located\n3. How existing components are structured and what patterns they follow\n4. Where prompt configuration is stored and how it's managed\n5. Any existing color-related components or utilities\n6. The styling approach used (CSS modules, Tailwind, styled-components, etc.)\n\nProvide a comprehensive summary of the codebase structure and relevant patterns I should follow for implementing this feature.",
  "subagent_type": "Explore"
}

🔧 Tool: Bash
Input: {
  "command": "find /Users/mhd/dev/gen-ai-poc/projet-gen-ia -maxdepth 2 -type f \\( -name \"package.json\" -o -name \"tsconfig.json\" -o -name \"vite.config.*\" -o -name \"webpack.config.*\" -o -name \".eslintrc*\" -o -name \"next.config.*\" \\) 2>/dev/null",
  "description": "Find project configuration files"
}

🔧 Tool: Glob
Input: {
  "pattern": "package.json",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia"
}

🔧 Tool: Glob
Input: {
  "pattern": "tsconfig.json",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/vite.config.*",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/package.json"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.{tsx,ts,jsx,js}",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia"
}

🔧 Tool: Grep
Input: {
  "pattern": "function|export|const",
  "type": "tsx",
  "output_mode": "files_with_matches",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia",
  "head_limit": 50
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/tsconfig.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/vite.config.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src"
}

🔧 Tool: Grep
Input: {
  "pattern": "prompt|color|palette|config",
  "type": "tsx",
  "output_mode": "files_with_matches",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src",
  "head_limit": 30
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/app.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/index.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/root.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/tailwind.config.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/tailwind.config.js"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/__root.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/app"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/lib"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/server"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard/prompt-builder.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/routes/dashboard/index.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/index.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/PromptBuilderForm.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/ColorPickerSection.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/schema.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/button.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/card.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/input.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/ArtisticDirectionSection.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/form.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/lib/utils.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/LogoUploadSection.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/select.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/CustomInstructionsSection.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/styles/app.css"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/textarea.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/label.tsx"
}

🔧 Tool: Grep
Input: {
  "pattern": "schema|table|migration",
  "type": "ts",
  "output_mode": "files_with_matches",
  "path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src",
  "head_limit": 20
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/server/db"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/lib/auth-client.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/theme-provider.tsx"
}

Now I have a comprehensive understanding of the codebase. Let me read the key files to understand the existing implementation and patterns in detail.

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/ColorPickerSection.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/schema.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/prompt-builder/PromptBuilderForm.tsx"
}

Now I have a clear understanding of the codebase. The existing `ColorPickerSection` already has basic color picking functionality with presets. Based on the feature requirements, I need to enhance this into a more comprehensive **Color Palette Manager** with:

1. **Color picker** (already exists, but can be enhanced)
2. **Palette presets** (already exists with 6 presets)
3. **Color visualization** (already has a basic preview bar)

To make this a more comprehensive "Color Palette Manager," I'll enhance the existing component with:
- More advanced color visualization (swatches, gradient preview, text contrast preview)
- Categorized palette presets with more options
- Color harmony generator (complementary, analogous, triadic)
- Accessibility contrast checker
- Custom palette saving functionality

Let me also check the existing UI components:

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/button.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/components/ui/card.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/lib/utils.ts"
}

Now I have a complete understanding of the existing codebase. Let me create a comprehensive Color Palette Manager by enhancing the existing `ColorPickerSection.tsx`. I'll add:

1. Enhanced color visualization (swatches, gradient view, text contrast preview)
2. More palette presets with categories
3. Color harmony generator
4. Accessibility contrast checker
5. Custom palette management

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create enhanced ColorPaletteManager component",
      "status": "in_progress",
      "activeForm": "Creating enhanced ColorPaletteManager component"
    },
    {
      "content": "Add color utility functions (harmony generator, contrast checker)",
      "status": "pending",
      "activeForm": "Adding color utility functions"
    },
    {
      "content": "Update schema for custom palette storage",
      "status": "pending",
      "activeForm": "Updating schema for custom palette storage"
    },
    {
      "content": "Add color visualization components",
      "status": "pending",
      "activeForm": "Adding color visualization components"
    },
    {
      "content": "Integrate into PromptBuilderForm",
      "status": "pending",
      "activeForm": "Integrating into PromptBuilderForm"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run and verify test passes",
      "status": "pending",
      "activeForm": "Running and verifying test passes"
    },
    {
      "content": "Delete temporary test file",
      "status": "pending",
      "activeForm": "Deleting temporary test file"
    }
  ]
}

Let me first create the color utility functions for harmony generation and contrast checking:

🔧 Tool: Write
Input: {
  "file_path": "/Users/mhd/dev/gen-ai-poc/projet-gen-ia/src/lib/color-utils.ts",
  "content": "/**\n * Color Utility Functions\n * Provides color manipulation, harmony generation, and accessibility checking\n */\n\n// Convert hex to RGB\nexport function hexToRgb(hex: string): { r: number; g: number; b: number } | null {\n  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);\n  return result\n    ? {\n        r: parseInt(result[1], 16),\n        g: parseInt(result[2], 16),\n        b: parseInt(result[3], 16),\n      }\n    : null;\n}\n\n// Convert RGB to hex\nexport function rgbToHex(r: number, g: number, b: number): string {\n  return (\n    \"#\" +\n    [r, g, b]\n      .map((x) => {\n        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);\n        return hex.length === 1 ? \"0\" + hex : hex;\n      })\n      .join(\"\")\n      .toUpperCase()\n  );\n}\n\n// Convert hex to HSL\nexport function hexToHsl(hex: string): { h: number; s: number; l: number } | null {\n  const rgb = hexToRgb(hex);\n  if (!rgb) return null;\n\n  const r = rgb.r / 255;\n  const g = rgb.g / 255;\n  const b = rgb.b / 255;\n\n  const max = Math.max(r, g, b);\n  const min = Math.min(r, g, b);\n  let h = 0;\n  let s = 0;\n  const l = (max + min) / 2;\n\n  if (max !== min) {\n    const d = max - min;\n    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);\n\n    switch (max) {\n      case r:\n        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;\n        break;\n      case g:\n        h = ((b - r) / d + 2) / 6;\n        break;\n      case b:\n        h = ((r - g) / d + 4) / 6;\n        break;\n    }\n  }\n\n  return { h: h * 360, s: s * 100, l: l * 100 };\n}\n\n// Convert HSL to hex\nexport function hslToHex(h: number, s: number, l: number): string {\n  h = h / 360;\n  s = s / 100;\n  l = l / 100;\n\n  const hue2rgb = (p: number, q: number, t: number) => {\n    if (t < 0) t += 1;\n    if (t > 1) t -= 1;\n    if (t < 1 / 6) return p + (q - p) * 6 * t;\n    if (t < 1 / 2) return q;\n    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;\n    return p;\n  };\n\n  let r, g, b;\n\n  if (s === 0) {\n    r = g = b = l;\n  } else {\n    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;\n    const p = 2 * l - q;\n    r = hue2rgb(p, q, h + 1 / 3);\n    g = hue2rgb(p, q, h);\n    b = hue2rgb(p, q, h - 1 / 3);\n  }\n\n  return rgbToHex(r * 255, g * 255, b * 255);\n}\n\n// Calculate relative luminance for contrast ratio\nexport function getLuminance(hex: string): number {\n  const rgb = hexToRgb(hex);\n  if (!rgb) return 0;\n\n  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {\n    v = v / 255;\n    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);\n  });\n\n  return 0.2126 * r + 0.7152 * g + 0.0722 * b;\n}\n\n// Calculate contrast ratio between two colors\nexport function getContrastRatio(color1: string, color2: string): number {\n  const l1 = getLuminance(color1);\n  const l2 = getLuminance(color2);\n  const lighter = Math.max(l1, l2);\n  const darker = Math.min(l1, l2);\n  return (lighter + 0.05) / (darker + 0.05);\n}\n\n// Check WCAG accessibility level\nexport function getAccessibilityLevel(\n  contrastRatio: number\n): \"AAA\" | \"AA\" | \"AA Large\" | \"Fail\" {\n  if (contrastRatio >= 7) return \"AAA\";\n  if (contrastRatio >= 4.5) return \"AA\";\n  if (contrastRatio >= 3) return \"AA Large\";\n  return \"Fail\";\n}\n\n// Generate complementary color\nexport function getComplementary(hex: string): string {\n  const hsl = hexToHsl(hex);\n  if (!hsl) return hex;\n  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);\n}\n\n// Generate analogous colors (colors adjacent on the color wheel)\nexport function getAnalogous(hex: string): [string, string, string] {\n  const hsl = hexToHsl(hex);\n  if (!hsl) return [hex, hex, hex];\n  return [\n    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),\n    hex,\n    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),\n  ];\n}\n\n// Generate triadic colors (three colors equally spaced on the color wheel)\nexport function getTriadic(hex: string): [string, string, string] {\n  const hsl = hexToHsl(hex);\n  if (!hsl) return [hex, hex, hex];\n  return [\n    hex,\n    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),\n    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),\n  ];\n}\n\n// Generate split-complementary colors\nexport function getSplitComplementary(hex: string): [string, string, string] {\n  const hsl = hexToHsl(hex);\n  if (!hsl) return [hex, hex, hex];\n  return [\n    hex,\n    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),\n    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),\n  ];\n}\n\n// Generate shades (darker variations)\nexport function getShades(hex: string, count: number = 5): string[] {\n  const hsl = hexToHsl(hex);\n  if (!hsl) return Array(count).fill(hex);\n\n  const shades: string[] = [];\n  const step = hsl.l / (count + 1);\n\n  for (let i = 1; i <= count; i++) {\n    shades.push(hslToHex(hsl.h, hsl.s, hsl.l - step * i));\n  }\n\n  return shades;\n}\n\n// Generate tints (lighter variations)\nexport function getTints(hex: string, count: number = 5): string[] {\n  const hsl = hexToHsl(hex);\n  if (!hsl) return Array(count).fill(hex);\n\n  const tints: string[] = [];\n  const step = (100 - hsl.l) / (count + 1);\n\n  for (let i = 1; i <= count; i++) {\n    tints.push(hslToHex(hsl.h, hsl.s, hsl.l + step * i));\n  }\n\n  return tints;\n}\n\n// Determine if a color is light or dark\nexport function isLightColor(hex: string): boolean {\n  const luminance = getLuminance(hex);\n  return luminance > 0.179;\n}\n\n// Get optimal text color for a background\nexport function getTextColor(backgroundColor: string): string {\n  return isLightColor(backgroundColor) ? \"#000000\" : \"#FFFFFF\";\n}\n\n// Validate hex color format\nexport function isValidHexColor(hex: string): boolean {\n  return /^#[0-9A-Fa-f]{6}$/.test(hex);\n}\n\n// Color palette presets organized by category\nexport interface ColorPalette {\n  id: string;\n  name: string;\n  category: string;\n  primary: string;\n  secondary: string;\n  accent: string;\n}\n\nexport const paletteCategories = [\n  \"Professional\",\n  \"Nature\",\n  \"Vibrant\",\n  \"Pastel\",\n  \"Dark\",\n  \"Neutral\",\n] as const;\n\nexport type PaletteCategory = (typeof paletteCategories)[number];\n\nexport const colorPalettes: ColorPalette[] = [\n  // Professional\n  {\n    id: \"corporate-blue\",\n    name: \"Corporate Blue\",\n    category: \"Professional\",\n    primary: \"#1E40AF\",\n    secondary: \"#3B82F6\",\n    accent: \"#DBEAFE\",\n  },\n  {\n    id: \"modern-slate\",\n    name: \"Modern Slate\",\n    category: \"Professional\",\n    primary: \"#475569\",\n    secondary: \"#94A3B8\",\n    accent: \"#F1F5F9\",\n  },\n  {\n    id: \"executive\",\n    name: \"Executive\",\n    category: \"Professional\",\n    primary: \"#1F2937\",\n    secondary: \"#6B7280\",\n    accent: \"#F9FAFB\",\n  },\n  // Nature\n  {\n    id: \"forest-green\",\n    name: \"Forest\",\n    category: \"Nature\",\n    primary: \"#166534\",\n    secondary: \"#22C55E\",\n    accent: \"#DCFCE7\",\n  },\n  {\n    id: \"ocean-breeze\",\n    name: \"Ocean Breeze\",\n    category: \"Nature\",\n    primary: \"#0369A1\",\n    secondary: \"#38BDF8\",\n    accent: \"#E0F2FE\",\n  },\n  {\n    id: \"sunset-glow\",\n    name: \"Sunset Glow\",\n    category: \"Nature\",\n    primary: \"#EA580C\",\n    secondary: \"#FB923C\",\n    accent: \"#FFF7ED\",\n  },\n  {\n    id: \"earth-tones\",\n    name: \"Earth Tones\",\n    category: \"Nature\",\n    primary: \"#78350F\",\n    secondary: \"#D97706\",\n    accent: \"#FFFBEB\",\n  },\n  // Vibrant\n  {\n    id: \"electric-purple\",\n    name: \"Electric Purple\",\n    category: \"Vibrant\",\n    primary: \"#7C3AED\",\n    secondary: \"#A78BFA\",\n    accent: \"#EDE9FE\",\n  },\n  {\n    id: \"hot-pink\",\n    name: \"Hot Pink\",\n    category: \"Vibrant\",\n    primary: \"#DB2777\",\n    secondary: \"#F472B6\",\n    accent: \"#FCE7F3\",\n  },\n  {\n    id: \"cyber-neon\",\n    name: \"Cyber Neon\",\n    category: \"Vibrant\",\n    primary: \"#06B6D4\",\n    secondary: \"#22D3EE\",\n    accent: \"#CFFAFE\",\n  },\n  {\n    id: \"ruby-red\",\n    name: \"Ruby Red\",\n    category: \"Vibrant\",\n    primary: \"#DC2626\",\n    secondary: \"#F87171\",\n    accent: \"#FEE2E2\",\n  },\n  // Pastel\n  {\n    id: \"soft-lavender\",\n    name: \"Soft Lavender\",\n    category: \"Pastel\",\n    primary: \"#A855F7\",\n    secondary: \"#D8B4FE\",\n    accent: \"#FAF5FF\",\n  },\n  {\n    id: \"mint-fresh\",\n    name: \"Mint Fresh\",\n    category: \"Pastel\",\n    primary: \"#10B981\",\n    secondary: \"#6EE7B7\",\n    accent: \"#ECFDF5\",\n  },\n  {\n    id: \"peach-cream\",\n    name: \"Peach Cream\",\n    category: \"Pastel\",\n    primary: \"#F97316\",\n    secondary: \"#FDBA74\",\n    accent: \"#FFF7ED\",\n  },\n  {\n    id: \"sky-blue\",\n    name: \"Sky Blue\",\n    category: \"Pastel\",\n    primary: \"#0EA5E9\",\n    secondary: \"#7DD3FC\",\n    accent: \"#F0F9FF\",\n  },\n  // Dark\n  {\n    id: \"midnight\",\n    name: \"Midnight\",\n    category: \"Dark\",\n    primary: \"#1E1B4B\",\n    secondary: \"#312E81\",\n    accent: \"#4338CA\",\n  },\n  {\n    id: \"charcoal\",\n    name: \"Charcoal\",\n    category: \"Dark\",\n    primary: \"#171717\",\n    secondary: \"#404040\",\n    accent: \"#737373\",\n  },\n  {\n    id: \"deep-ocean\",\n    name: \"Deep Ocean\",\n    category: \"Dark\",\n    primary: \"#0C4A6E\",\n    secondary: \"#075985\",\n    accent: \"#0284C7\",\n  },\n  // Neutral\n  {\n    id: \"warm-gray\",\n    name: \"Warm Gray\",\n    category: \"Neutral\",\n    primary: \"#57534E\",\n    secondary: \"#A8A29E\",\n    accent: \"#F5F5F4\",\n  },\n  {\n    id: \"cool-gray\",\n    name: \"Cool Gray\",\n    category: \"Neutral\",\n    primary: \"#52525B\",\n    secondary: \"#A1A1AA\",\n    accent: \"#FAFAFA\",\n  },\n  {\n    id: \"stone\",\n    name: \"Stone\",\n    category: \"Neutral\",\n    primary: \"#44403C\",\n    secondary: \"#78716C\",\n    accent: \"#F5F5F4\",\n  },\n];\n\n// Get palettes by category\nexport function getPalettesByCategory(category: PaletteCategory): ColorPalette[] {\n  return colorPalettes.filter((p) => p.category === category);\n}\n\n// Generate a palette from a single color\nexport function generatePaletteFromColor(primaryHex: string): ColorPalette {\n  const hsl = hexToHsl(primaryHex);\n  if (!hsl) {\n    return {\n      id: \"custom\",\n      name: \"Custom\",\n      category: \"Custom\",\n      primary: primaryHex,\n      secondary: primaryHex,\n      accent: \"#FFFFFF\",\n    };\n  }\n\n  // Secondary: lighter version with slightly reduced saturation\n  const secondaryL = Math.min(hsl.l + 20, 85);\n  const secondaryS = Math.max(hsl.s - 10, 30);\n  const secondary = hslToHex(hsl.h, secondaryS, secondaryL);\n\n  // Accent: very light version\n  const accentL = Math.min(hsl.l + 45, 98);\n  const accentS = Math.max(hsl.s - 60, 10);\n  const accent = hslToHex(hsl.h, accentS, accentL);\n\n  return {\n    id: \"generated\",\n    name: \"Generated\",\n    category: \"Custom\",\n    primary: primaryHex,\n    secondary,\n    accent,\n  };\n}\n"
}
