import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Sparkles, Users, Building2 } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { PromptBuilderFormData } from "./schema";
import { styleOptions, moodOptions, industryOptions } from "./schema";

interface ArtisticDirectionSectionProps {
  form: UseFormReturn<PromptBuilderFormData>;
  className?: string;
}

interface StyleCardProps {
  value: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function StyleCard({ value, label, isSelected, onClick }: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border text-left transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
          : "border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5"
      )}
      data-testid={`style-card-${value}`}
    >
      <span
        className={cn(
          "text-sm font-medium",
          isSelected ? "text-primary" : "text-foreground"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function MoodCard({ value, label, isSelected, onClick }: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200",
        isSelected
          ? "border-primary bg-primary text-white"
          : "border-gray-200 dark:border-white/10 text-muted-foreground hover:border-primary/50 hover:text-foreground"
      )}
      data-testid={`mood-card-${value}`}
    >
      {label}
    </button>
  );
}

export function ArtisticDirectionSection({ form, className }: ArtisticDirectionSectionProps) {
  const selectedStyle = form.watch("style");
  const selectedMood = form.watch("mood");

  return (
    <Card className={cn("", className)} data-testid="artistic-direction-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Artistic Direction
        </CardTitle>
        <CardDescription>
          Define the visual style and mood for your brand's creative direction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Style Selection */}
        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visual Style *</FormLabel>
              <FormDescription>
                Choose the overall aesthetic for your brand visuals
              </FormDescription>
              <FormControl>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {styleOptions.map((option) => (
                    <StyleCard
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      isSelected={field.value === option.value}
                      onClick={() => field.onChange(option.value)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mood Selection */}
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Mood *</FormLabel>
              <FormDescription>
                Select the emotional tone you want to convey
              </FormDescription>
              <FormControl>
                <div className="flex flex-wrap gap-2 mt-3">
                  {moodOptions.map((option) => (
                    <MoodCard
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      isSelected={field.value === option.value}
                      onClick={() => field.onChange(option.value)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Industry and Target Audience */}
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Industry
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full" data-testid="industry-select">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Helps tailor visuals to your sector
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Target Audience
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Young professionals, 25-35"
                    {...field}
                    data-testid="target-audience-input"
                  />
                </FormControl>
                <FormDescription>
                  Who are you trying to reach?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Summary Preview */}
        {(selectedStyle || selectedMood) && (
          <div className="p-4 rounded-lg bg-muted/50 border border-muted" data-testid="artistic-summary">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Your Direction Summary:
            </p>
            <p className="text-sm">
              {selectedStyle && (
                <span>
                  <strong>
                    {styleOptions.find((s) => s.value === selectedStyle)?.label}
                  </strong>{" "}
                  style
                </span>
              )}
              {selectedStyle && selectedMood && " with a "}
              {selectedMood && (
                <span>
                  <strong>
                    {moodOptions.find((m) => m.value === selectedMood)?.label}
                  </strong>{" "}
                  mood
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
