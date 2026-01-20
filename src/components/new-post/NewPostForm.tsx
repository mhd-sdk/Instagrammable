import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, FileText, ImagePlus, Loader2, RotateCcw, Send, X } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { ImageUpload } from "~/components/ui/image-upload";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { editProductImageFn } from "~/fn/image-edit";
import { getUserPromptConfigurationsFn } from "~/fn/prompts";
import { cn } from "~/lib/utils";
import type { MediaUploadResult } from "~/utils/storage/media-helpers";
import { defaultValues, newPostSchema, type NewPostFormData } from "./schema";

interface NewPostFormProps {
  className?: string;
  onSubmit?: (data: NewPostFormData) => Promise<unknown>;
  initialValues?: Partial<NewPostFormData>;
}

export function NewPostForm({
  className,
  onSubmit,
  initialValues,
}: NewPostFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(
    initialValues?.imageUrl || null
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [editedImageData, setEditedImageData] = React.useState<string | null>(null);
  const [editDescription, setEditDescription] = React.useState<string>("");
  const [appliedBrandElements, setAppliedBrandElements] = React.useState<any>(null);
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);

  const form = useForm<NewPostFormData>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  const handleSubmit = async (data: NewPostFormData) => {
    setIsPending(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      toast.success("Post created successfully!");
      // Reset form after successful submission
      form.reset(defaultValues);
      setUploadedImage(null);
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleReset = () => {
    form.reset(defaultValues);
    setUploadedImage(null);
    setEditedImageData(null);
    setEditDescription("");
    setAppliedBrandElements(null);
    setShowPreview(false);
    toast.info("Form has been reset");
  };

  const handlePreview = async () => {
    const imageUrl = form.getValues("imageUrl");
    const prompt = form.getValues("prompt");

    console.log("handlePreview - imageUrl:", imageUrl);
    console.log("handlePreview - uploadedImage:", uploadedImage);

    if (!imageUrl || imageUrl === "") {
      toast.error("Please upload an image first");
      return;
    }

    setIsGenerating(true);

    try {
      // Récupérer les configurations du prompt builder de l'utilisateur
      const configs = await getUserPromptConfigurationsFn();
      
      console.log("User configs:", configs);
      
      // Utiliser la première configuration (ou celle par défaut)
      const userConfig = configs && configs.length > 0 ? configs[0] : null;
      const promptConfigId = userConfig?.id;

      // Construire l'URL complète pour l'image
      // Utiliser 127.0.0.1 au lieu de localhost pour éviter les problèmes de validation
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://127.0.0.1:3000'
        : window.location.origin;
      const fullImageUrl = `${baseUrl}/api/uploads/${imageUrl}`;
      
      console.log("Calling editProductImageFn with URL:", fullImageUrl);
      console.log("Using config ID:", promptConfigId);

      const result = await editProductImageFn({
        data: {
          image: {
            url: fullImageUrl,
          },
          promptConfigId: promptConfigId,
          customInstructions: prompt || undefined,
          enhancementMode: "moderate",
        },
      });

      if (result.success && result.editedImage) {
        // Créer un data URL à partir de l'image base64 retournée
        const imageDataUrl = `data:${result.editedImage.mimeType};base64,${result.editedImage.data}`;
        setEditedImageData(imageDataUrl);
        setEditDescription(result.description || "");
        setAppliedBrandElements(result.appliedBrandElements);
        setShowPreview(true);
        toast.success("Image edited successfully!");
      } else {
        toast.error(result.error?.message || "Failed to edit image");
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("An error occurred while generating the preview");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleSelectAndSubmit = async () => {
    if (!editedImageData) {
      toast.error("No edited image available");
      return;
    }

    setIsGenerating(true);

    try {
      // Convertir le data URL en Blob
      const response = await fetch(editedImageData);
      const blob = await response.blob();

      // Générer un chemin unique pour l'image éditée
      // Utiliser le même dossier que l'image originale
      const originalImageUrl = form.getValues("imageUrl");
      const userId = originalImageUrl.split('/')[1]; // Extraire userId du chemin
      const fileName = `edited-${Date.now()}.png`;
      const editedImagePath = `attachments/${userId}/${fileName}`;

      // Uploader l'image éditée vers le serveur via PUT
      const uploadResponse = await fetch(`/api/uploads/${editedImagePath}`, {
        method: 'PUT',
        headers: {
          'Content-Type': blob.type,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload edited image');
      }

      // Mettre à jour le formulaire avec l'image éditée
      form.setValue("imageUrl", editedImagePath, { shouldValidate: true });
      setUploadedImage(editedImageData); // Afficher l'image éditée dans le form

      toast.success("Using edited image", {
        description: editDescription,
      });

      setShowPreview(false);

      // Continuer avec la soumission normale
      const data = form.getValues();
      await handleSubmit(data);
    } catch (error) {
      console.error("Error uploading edited image:", error);
      toast.error("Failed to upload edited image. Using original instead.");
      setShowPreview(false);
      
      // Fallback: soumettre avec l'image originale
      const data = form.getValues();
      await handleSubmit(data);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUploadComplete = (results: MediaUploadResult[]) => {
    if (results.length > 0) {
      // Use previewUrl for display and fileKey as the stored URL
      // The previewUrl is a local blob URL, fileKey is the storage path
      const result = results[0];
      const displayUrl = result.previewUrl || result.fileKey;
      setUploadedImage(displayUrl);
      form.setValue("imageUrl", result.fileKey, { shouldValidate: true });
      toast.success("Image uploaded successfully!");
    }
  };

  const handleImageClear = () => {
    setUploadedImage(null);
    form.setValue("imageUrl", "", { shouldValidate: true });
  };

  const isFormDirty = form.formState.isDirty;
  const imageUrlValue = form.watch("imageUrl");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-8", className)}
        data-testid="new-post-form"
      >
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Create New Post
              </h1>
              <p className="text-muted-foreground mt-2">
                Upload an image and add a prompt to create your post
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
                type="button"
                onClick={handlePreview}
                disabled={isGenerating || !imageUrlValue}
                data-testid="preview-button"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Image Upload */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImagePlus className="h-5 w-5 text-primary" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Select an image to include in your post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {uploadedImage ? (
                        <div className="space-y-4">
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                            <img
                              src={uploadedImage}
                              alt="Uploaded preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleImageClear}
                            className="w-full"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <ImageUpload
                          onUploadsComplete={handleImageUploadComplete}
                          onClear={handleImageClear}
                          maxFiles={1}
                          multiple={false}
                          autoUpload={true}
                          placeholder="Drag and drop your image here, or click to browse"
                          data-testid="image-upload"
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Right Column - Title and Prompt */}
          <div className="space-y-6">
            {/* Title Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Post Details
                </CardTitle>
                <CardDescription>
                  Add a title and prompt for your post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title Input */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a title for your post..."
                          {...field}
                          data-testid="title-input"
                        />
                      </FormControl>
                      <FormDescription>
                        Give your post a memorable title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Prompt Textarea */}
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your image or add any context, instructions, or details..."
                          className="min-h-[150px] resize-none"
                          {...field}
                          data-testid="prompt-input"
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/2000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImagePlus className="h-4 w-4" />
            <span>
              Upload an image and add a prompt to create your post
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
              type="button"
              onClick={handlePreview}
              size="lg"
              disabled={isGenerating || !imageUrlValue}
              className="w-full sm:w-auto"
              data-testid="preview-button-bottom"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Post
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Edited Image</DialogTitle>
            <DialogDescription>
              Review the AI-edited image based on your brand identity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {editedImageData && (
              <div className="space-y-4">
                {/* Comparison: Original vs Edited */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Original Image</h3>
                    <div 
                      className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setLightboxImage(uploadedImage)}
                    >
                      <img
                        src={uploadedImage || ""}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">AI Edited Image</h3>
                    <div 
                      className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary bg-muted cursor-pointer hover:border-primary/80 transition-colors"
                      onClick={() => setLightboxImage(editedImageData)}
                    >
                      <img
                        src={editedImageData}
                        alt="Edited by AI"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description and Brand Elements */}
                {(editDescription || appliedBrandElements) && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {editDescription && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              AI Description:
                            </p>
                            <p className="text-sm">
                              {editDescription}
                            </p>
                          </div>
                        )}

                        {appliedBrandElements && (
                          <>
                            {appliedBrandElements.colors && appliedBrandElements.colors.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                  Applied Brand Colors:
                                </p>
                                <div className="flex gap-2">
                                  {appliedBrandElements.colors.map((color: string, i: number) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2"
                                    >
                                      <div
                                        className="w-8 h-8 rounded border border-border"
                                        style={{ backgroundColor: color }}
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        {color}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {appliedBrandElements.style && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  Style:
                                </p>
                                <p className="text-sm">
                                  {appliedBrandElements.style}
                                  {appliedBrandElements.tone && ` with ${appliedBrandElements.tone} tone`}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClosePreview}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSelectAndSubmit}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Use Edited Image & Create Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal for Full-Size Image */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            {lightboxImage && (
              <img
                src={lightboxImage}
                alt="Full size view"
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

export default NewPostForm;
