import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Palette, Copy, Check } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { PromptBuilderFormData } from "./schema";

interface ColorPickerSectionProps {
  form: UseFormReturn<PromptBuilderFormData>;
  className?: string;
}

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  testId?: string;
}

function ColorInput({ value, onChange, label, description, testId }: ColorInputProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.toUpperCase());
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("#")) {
      val = "#" + val;
    }
    onChange(val.toUpperCase());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <Copy className="h-3 w-3 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="color"
            value={value || "#000000"}
            onChange={handleColorPickerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-testid={testId ? `${testId}-picker` : undefined}
          />
          <div
            className="w-12 h-10 rounded-lg border border-gray-300 dark:border-white/10 shadow-sm cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: value || "#000000" }}
            data-testid={testId ? `${testId}-preview` : undefined}
          />
        </div>
        <Input
          value={value || ""}
          onChange={handleTextChange}
          placeholder="#000000"
          className="flex-1 font-mono uppercase"
          maxLength={7}
          data-testid={testId}
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function ColorPickerSection({ form, className }: ColorPickerSectionProps) {
  const primaryColor = form.watch("primaryColor");
  const secondaryColor = form.watch("secondaryColor");
  const accentColor = form.watch("accentColor");

  return (
    <Card className={cn("", className)} data-testid="color-picker-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5 text-primary" />
          Brand Colors
        </CardTitle>
        <CardDescription>
          Define your brand's color palette to maintain visual consistency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Preview Bar */}
        <div className="flex h-12 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-white/10">
          <div
            className="flex-1 transition-colors duration-200"
            style={{ backgroundColor: primaryColor || "#6366F1" }}
            data-testid="color-preview-primary"
          />
          <div
            className="flex-1 transition-colors duration-200"
            style={{ backgroundColor: secondaryColor || "#E5E7EB" }}
            data-testid="color-preview-secondary"
          />
          <div
            className="flex-1 transition-colors duration-200"
            style={{ backgroundColor: accentColor || "#F3F4F6" }}
            data-testid="color-preview-accent"
          />
        </div>

        {/* Color Inputs */}
        <div className="grid gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ColorInput
                    value={field.value}
                    onChange={field.onChange}
                    label="Primary Color *"
                    description="Main brand color"
                    testId="primary-color-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryColor"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ColorInput
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="Secondary Color"
                    description="Supporting color"
                    testId="secondary-color-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accentColor"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ColorInput
                    value={field.value || ""}
                    onChange={field.onChange}
                    label="Accent Color"
                    description="Highlight elements"
                    testId="accent-color-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preset Color Palettes */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Quick Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                className="group flex items-center gap-1 p-1 pr-2 rounded-full border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-colors"
                onClick={() => {
                  form.setValue("primaryColor", preset.primary);
                  form.setValue("secondaryColor", preset.secondary);
                  form.setValue("accentColor", preset.accent);
                }}
                data-testid={`color-preset-${index}`}
              >
                <div className="flex rounded-full overflow-hidden">
                  <div
                    className="w-5 h-5"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-5 h-5"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div
                    className="w-5 h-5"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const colorPresets = [
  {
    name: "Ocean",
    primary: "#0EA5E9",
    secondary: "#7DD3FC",
    accent: "#F0F9FF",
  },
  {
    name: "Forest",
    primary: "#22C55E",
    secondary: "#86EFAC",
    accent: "#F0FDF4",
  },
  {
    name: "Sunset",
    primary: "#F97316",
    secondary: "#FDBA74",
    accent: "#FFF7ED",
  },
  {
    name: "Royal",
    primary: "#8B5CF6",
    secondary: "#C4B5FD",
    accent: "#F5F3FF",
  },
  {
    name: "Rose",
    primary: "#EC4899",
    secondary: "#F9A8D4",
    accent: "#FDF2F8",
  },
  {
    name: "Slate",
    primary: "#475569",
    secondary: "#94A3B8",
    accent: "#F8FAFC",
  },
];
