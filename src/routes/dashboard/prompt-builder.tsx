import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PromptBuilderForm, type PromptBuilderFormData } from "~/components/prompt-builder";
import {
  savePromptConfigurationFn,
  getDefaultPromptConfigurationFn,
  updatePromptConfigurationFn,
} from "~/fn/prompts";

export const Route = createFileRoute("/dashboard/prompt-builder")({
  component: PromptBuilderPage,
  loader: async () => {
    // Load the default configuration if one exists
    try {
      const defaultConfig = await getDefaultPromptConfigurationFn();
      return { defaultConfig };
    } catch {
      return { defaultConfig: null };
    }
  },
});

function PromptBuilderPage() {
  const { defaultConfig } = Route.useLoaderData();
  const [existingConfigId, setExistingConfigId] = useState<string | null>(
    defaultConfig?.id ?? null
  );

  // Transform loaded config to form data format
  const initialValues: Partial<PromptBuilderFormData> | undefined = defaultConfig
    ? {
        configName: defaultConfig.name || "",
        logo: defaultConfig.logo?.url || "",
        primaryColor: defaultConfig.colorPalette?.primaryColor || "#6366F1",
        secondaryColor: defaultConfig.colorPalette?.secondaryColor || "",
        accentColor: defaultConfig.colorPalette?.accentColor || "",
        style: defaultConfig.artisticDirection?.style || "",
        mood: defaultConfig.artisticDirection?.tone || "",
        industry: defaultConfig.artisticDirection?.keywords || "",
        targetAudience: "",
        customInstructions: defaultConfig.artisticDirection?.description || "",
      }
    : undefined;

  const handleSubmit = async (data: PromptBuilderFormData) => {
    // Map form data to server function schema
    const serverData = {
      configName: data.configName || "My Brand Identity",
      configDescription: "",
      isDefault: true,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor || "",
      accentColor: data.accentColor || "",
      style: data.style,
      mood: data.mood,
      industry: data.industry || "",
      targetAudience: data.targetAudience || "",
      logoUrl: data.logo || "",
      logoName: data.logo ? "Brand Logo" : "",
      customInstructions: data.customInstructions || "",
    };

    if (existingConfigId) {
      // Update existing configuration
      const result = await updatePromptConfigurationFn({
        data: {
          id: existingConfigId,
          ...serverData,
        },
      });
      return result;
    } else {
      // Create new configuration
      const result = await savePromptConfigurationFn({
        data: serverData,
      });
      // Store the new config ID for future updates
      if (result?.id) {
        setExistingConfigId(result.id);
      }
      return result;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <PromptBuilderForm onSubmit={handleSubmit} initialValues={initialValues} />
    </div>
  );
}
