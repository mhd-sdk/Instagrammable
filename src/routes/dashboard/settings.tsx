import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Home, Instagram, Link2, Link2Off, RefreshCw, Upload, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AppBreadcrumb } from "~/components/AppBreadcrumb";
import { Page } from "~/components/Page";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "~/components/ui/panel";
import { UserAvatar } from "~/components/UserAvatar";
import { assertAuthenticatedFn } from "~/fn/guards";
import {
  useDisconnectInstagram,
  useInstagramConnection,
  useRefreshInstagramToken,
} from "~/hooks/useInstagram";
import { useUpdateUserProfile } from "~/hooks/useProfile";
import { useUserAvatar } from "~/hooks/useUserAvatar";
import { authClient } from "~/lib/auth-client";
import { publicEnv } from "~/config/publicEnv";
import { uploadImageWithPresignedUrl } from "~/utils/storage/helpers";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
  beforeLoad: async () => {
    await assertAuthenticatedFn();
  },
});

const profileSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be 50 characters or less")
    .trim(),
});

type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

function ProfileSettings() {
  const { data: session } = authClient.useSession();
  const [isUploading, setIsUploading] = useState(false);
  const { avatarUrl } = useUserAvatar();

  const updateProfileMutation = useUpdateUserProfile();

  const form = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
  });

  // Update form when session changes
  useEffect(() => {
    if (session?.user?.name) {
      form.reset({ name: session.user.name });
    }
  }, [session?.user?.name, form]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setIsUploading(true);

      try {
        // Generate image key
        const userId = session?.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const fileExtension = file.name.split(".").pop() || "";
        const imageKey = `profile-images/${userId}/${Date.now()}.${fileExtension}`;

        // Upload using helper function
        await uploadImageWithPresignedUrl(imageKey, file);

        // Update user profile with new image key
        await updateProfileMutation.mutateAsync({
          data: { image: imageKey },
        });

        toast.success("Avatar uploaded successfully");
      } catch (error) {
        console.error("Avatar upload error:", error);
        toast.error("Failed to upload avatar");
      } finally {
        setIsUploading(false);
      }
    },
    [updateProfileMutation, session]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
  });

  const onSubmit = (data: ProfileSettingsFormData) => {
    updateProfileMutation.mutate({
      data: { name: data.name },
    });
  };

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </PanelTitle>
      </PanelHeader>
      <PanelContent className="space-y-6">
        {/* Profile Settings Row */}
        <div className="flex items-start gap-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-2">
            <Label className="self-start">Profile Picture</Label>
            <div
              {...getRootProps()}
              className={`relative cursor-pointer group w-20 h-20 ${
                isUploading ? "cursor-not-allowed" : ""
              }`}
            >
              <input {...getInputProps()} disabled={isUploading} />
              <UserAvatar
                imageKey={session?.user?.image || null}
                name={session?.user?.name || null}
                email={session?.user?.email || null}
                size="xl"
              />
              <div
                className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                  isUploading ? "opacity-100" : ""
                }`}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Upload className="h-5 w-5 text-white" />
                )}
              </div>
              {isDragActive && (
                <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/20 rounded-full flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Click to upload
              <br />
              PNG, JPG, GIF up to 5MB
            </p>
          </div>

          {/* Display Name */}
          <div className="flex-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your display name"
                            disabled={updateProfileMutation.isPending}
                          />
                        </FormControl>
                        <Button
                          type="submit"
                          disabled={
                            updateProfileMutation.isPending ||
                            !form.formState.isDirty ||
                            !form.formState.isValid
                          }
                        >
                          {updateProfileMutation.isPending
                            ? "Saving..."
                            : "Save"}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}

function InstagramSettings() {
  const { data: connection, isLoading } = useInstagramConnection();
  const disconnectMutation = useDisconnectInstagram();
  const refreshTokenMutation = useRefreshInstagramToken();
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle OAuth callback query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const instagramStatus = urlParams.get("instagram");
    const error = urlParams.get("error");

    if (instagramStatus === "connected") {
      toast.success("Instagram account connected successfully!");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      const errorMessages: Record<string, string> = {
        instagram_auth_failed: "Instagram authentication failed. Please try again.",
        not_authenticated: "You must be logged in to connect Instagram.",
        token_exchange_failed: "Failed to complete Instagram connection. Please try again.",
        instagram_error: "An error occurred with Instagram. Please try again.",
      };
      toast.error(errorMessages[error] || "Instagram connection failed.");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Build Instagram OAuth URL manually to use our custom callback
      const baseUrl = publicEnv.BETTER_AUTH_URL || window.location.origin;
      const redirectUri = `${baseUrl}/api/instagram/callback`;
      const clientId = publicEnv.INSTAGRAM_CLIENT_ID;

      if (!clientId) {
        toast.error("Instagram Client ID not configured");
        setIsConnecting(false);
        return;
      }

      // Build the Instagram authorization URL
      const oauthUrl = new URL("https://www.instagram.com/oauth/authorize");
      oauthUrl.searchParams.set("client_id", clientId);
      oauthUrl.searchParams.set("redirect_uri", redirectUri);
      oauthUrl.searchParams.set("scope", "instagram_business_basic,instagram_business_content_publish");
      oauthUrl.searchParams.set("response_type", "code");

      console.log("Instagram OAuth - Redirect URI:", redirectUri);
      console.log("Instagram OAuth - Full URL:", oauthUrl.toString());

      // Redirect to Instagram authorization
      window.location.href = oauthUrl.toString();
    } catch (error) {
      console.error("Instagram connection error:", error);
      toast.error("Failed to connect Instagram account");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate({});
  };

  const handleRefreshToken = () => {
    refreshTokenMutation.mutate({});
  };

  if (isLoading) {
    return (
      <Panel>
        <PanelHeader>
          <PanelTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Connection
          </PanelTitle>
        </PanelHeader>
        <PanelContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          </div>
        </PanelContent>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Instagram Connection
        </PanelTitle>
      </PanelHeader>
      <PanelContent className="space-y-4">
        {connection?.connected ? (
          <div className="space-y-4">
            {/* Connected Status */}
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <Link2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Connected to Instagram
                  </p>
                  {connection.username && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      @{connection.username}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connection.tokenExpired && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshToken}
                    disabled={refreshTokenMutation.isPending}
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  >
                    {refreshTokenMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh Token
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Link2Off className="h-4 w-4 mr-2" />
                  )}
                  Disconnect
                </Button>
              </div>
            </div>

            {/* Token Expiration Warning */}
            {connection.tokenExpired && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Token Expiring Soon
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your Instagram access token is about to expire. Please refresh it to
                    continue using Instagram features.
                  </p>
                </div>
              </div>
            )}

            {/* Connected At Info */}
            {connection.connectedAt && (
              <p className="text-sm text-muted-foreground">
                Connected on {new Date(connection.connectedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect your Instagram account to enable posting and scheduling features.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
            >
              {isConnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Instagram className="h-4 w-4 mr-2" />
              )}
              Connect Instagram
            </Button>
            <p className="text-xs text-muted-foreground">
              Note: Instagram requires a Business or Creator account. Personal accounts are not
              supported. HTTPS is required for OAuth - in development, you may need to use
              a service like ngrok or deploy to a staging environment.
            </p>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}

function SettingsPage() {
  return (
    <Page>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard", icon: Home },
          { label: "Settings" },
        ]}
      />

      <div className="mt-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile information and connected accounts
          </p>
        </div>

        <div className="space-y-6">
          <ProfileSettings />
          <InstagramSettings />
        </div>
      </div>
    </Page>
  );
}
