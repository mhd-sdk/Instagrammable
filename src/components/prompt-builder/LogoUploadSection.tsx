import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Upload, X, Image as ImageIcon } from "lucide-react";
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

interface LogoUploadSectionProps {
  form: UseFormReturn<PromptBuilderFormData>;
  className?: string;
}

export function LogoUploadSection({ form, className }: LogoUploadSectionProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const logoUrl = form.watch("logo");

  React.useEffect(() => {
    if (logoUrl && logoUrl.length > 0) {
      setPreviewUrl(logoUrl);
    }
  }, [logoUrl]);

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    []
  );

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      form.setValue("logo", result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    form.setValue("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={cn("", className)} data-testid="logo-upload-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-primary" />
          Logo Upload
        </CardTitle>
        <CardDescription>
          Upload your brand logo to help generate visuals that match your identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-white/10 hover:border-primary/50 hover:bg-gray-50/50 dark:hover:bg-white/5",
            previewUrl && "border-solid border-primary/30"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="logo-dropzone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="logo-file-input"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="max-h-32 max-w-full object-contain rounded-lg"
                  data-testid="logo-preview"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  data-testid="logo-remove-button"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Click or drag to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop your logo here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, SVG up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* URL Input Alternative */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or enter URL
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Logo URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/logo.png"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (e.target.value) {
                      setPreviewUrl(e.target.value);
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                  data-testid="logo-url-input"
                />
              </FormControl>
              <FormDescription>
                Enter a direct URL to your logo image
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
