import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { FileText, Lightbulb } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { PromptBuilderFormData } from "./schema";

interface CustomInstructionsSectionProps {
  form: UseFormReturn<PromptBuilderFormData>;
  className?: string;
}

const suggestionPrompts = [
  "Always include our tagline in promotional materials",
  "Avoid using competitor brand colors (red and black)",
  "Prefer rounded shapes over sharp corners",
  "Include natural elements like leaves or water",
  "Keep designs minimal with lots of whitespace",
  "Use gradient effects sparingly",
];

export function CustomInstructionsSection({ form, className }: CustomInstructionsSectionProps) {
  const instructionsValue = form.watch("customInstructions") || "";
  const characterCount = instructionsValue.length;
  const maxCharacters = 2000;

  const handleSuggestionClick = (suggestion: string) => {
    const currentValue = form.getValues("customInstructions") || "";
    const newValue = currentValue
      ? `${currentValue}\n• ${suggestion}`
      : `• ${suggestion}`;
    form.setValue("customInstructions", newValue);
  };

  return (
    <Card className={cn("", className)} data-testid="custom-instructions-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Custom Instructions
        </CardTitle>
        <CardDescription>
          Add any specific requirements, preferences, or guidelines for your brand
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Suggestion Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span>Quick suggestions (click to add)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestionPrompts.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
                data-testid={`suggestion-${index}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <FormField
          control={form.control}
          name="customInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Custom Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional instructions or preferences for your brand identity...

Examples:
• Always maintain a professional tone
• Prefer using photography over illustrations
• Our brand mascot is a friendly owl
• Never use Comic Sans font"
                  className="min-h-[200px] resize-y"
                  {...field}
                  data-testid="custom-instructions-textarea"
                />
              </FormControl>
              <div className="flex items-center justify-between">
                <FormDescription>
                  These instructions will be used to guide all generated content
                </FormDescription>
                <span
                  className={cn(
                    "text-xs",
                    characterCount > maxCharacters * 0.9
                      ? "text-destructive"
                      : characterCount > maxCharacters * 0.7
                        ? "text-yellow-600 dark:text-yellow-500"
                        : "text-muted-foreground"
                  )}
                  data-testid="character-count"
                >
                  {characterCount} / {maxCharacters}
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Guidelines Card */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Tips for better results
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Be specific about what you want to include or avoid</li>
            <li>• Mention any brand guidelines that must be followed</li>
            <li>• Include preferences for imagery, icons, or typography</li>
            <li>• Describe any unique brand elements or mascots</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
