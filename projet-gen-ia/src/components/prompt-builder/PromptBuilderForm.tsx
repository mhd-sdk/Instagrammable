import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, RotateCcw, Wand2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { LogoUploadSection } from "./LogoUploadSection";
import { ColorPickerSection } from "./ColorPickerSection";
import { ArtisticDirectionSection } from "./ArtisticDirectionSection";
import { CustomInstructionsSection } from "./CustomInstructionsSection";
import {
  promptBuilderSchema,
  defaultValues,
  type PromptBuilderFormData,
} from "./schema";

interface PromptBuilderFormProps {
  className?: string;
  onSubmit?: (data: PromptBuilderFormData) => Promise<unknown>;
  initialValues?: Partial<PromptBuilderFormData>;
}

export function PromptBuilderForm({
  className,
  onSubmit,
  initialValues,
}: PromptBuilderFormProps) {
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<PromptBuilderFormData>({
    resolver: zodResolver(promptBuilderSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  const handleSubmit = async (data: PromptBuilderFormData) => {
    setIsPending(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      toast.success("Brand identity saved successfully!");
    } catch (error) {
      toast.error("Failed to save brand identity. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleReset = () => {
    form.reset(defaultValues);
    toast.info("Form has been reset");
  };

  const isFormDirty = form.formState.isDirty;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-8", className)}
        data-testid="prompt-builder-form"
      >
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Brand Identity Builder
              </h1>
              <p className="text-muted-foreground mt-2">
                Define your brand's visual identity to generate consistent, on-brand content
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={!isFormDirty || isPending}
                data-testid="reset-button"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="submit-button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Identity
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Brand Name Input */}
          <FormField
            control={form.control}
            name="configName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                    <Input
                      placeholder="Enter your brand name (e.g., My Awesome Brand)"
                      className="pl-10 h-12 text-lg font-medium border-primary/20 focus:border-primary"
                      {...field}
                      data-testid="config-name-input"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Sections */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            <LogoUploadSection form={form} />
            <ColorPickerSection form={form} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ArtisticDirectionSection form={form} />
            <CustomInstructionsSection form={form} />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wand2 className="h-4 w-4" />
            <span>
              Complete all required fields to unlock AI-powered content generation
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={!isFormDirty || isPending}
              className="hidden sm:flex"
            >
              Clear All
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="w-full sm:w-auto"
              data-testid="submit-button-bottom"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Brand Identity...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Brand Identity
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Debug Preview (can be removed in production) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 p-4 rounded-lg bg-muted/30 border border-muted">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              Debug: Form Values
            </summary>
            <pre className="mt-4 text-xs overflow-auto">
              {JSON.stringify(form.watch(), null, 2)}
            </pre>
          </details>
        )}
      </form>
    </Form>
  );
}
