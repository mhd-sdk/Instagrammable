import { queryOptions } from "@tanstack/react-query";
import { getInstagramConnectionFn } from "~/fn/instagram";

/**
 * Query for current user's Instagram connection status
 */
export const instagramConnectionQueryOptions = () =>
  queryOptions({
    queryKey: ["instagram-connection"],
    queryFn: () => getInstagramConnectionFn(),
  });
