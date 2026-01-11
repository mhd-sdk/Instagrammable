import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectInstagramFn,
  refreshInstagramTokenFn,
} from "~/fn/instagram";
import { instagramConnectionQueryOptions } from "~/queries/instagram";

/**
 * Hook for fetching Instagram connection status
 */
export function useInstagramConnection() {
  return useQuery(instagramConnectionQueryOptions());
}

/**
 * Hook for disconnecting Instagram account
 */
export function useDisconnectInstagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectInstagramFn,
    onSuccess: () => {
      toast.success("Instagram account disconnected");
      queryClient.invalidateQueries({ queryKey: ["instagram-connection"] });
    },
    onError: () => {
      toast.error("Failed to disconnect Instagram account");
    },
  });
}

/**
 * Hook for refreshing Instagram token
 */
export function useRefreshInstagramToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshInstagramTokenFn,
    onSuccess: () => {
      toast.success("Instagram token refreshed");
      queryClient.invalidateQueries({ queryKey: ["instagram-connection"] });
    },
    onError: () => {
      toast.error("Failed to refresh Instagram token. Please reconnect your account.");
    },
  });
}
