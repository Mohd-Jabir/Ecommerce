
import { useQuery } from "@tanstack/react-query";
import { getVendorAnalytics } from "../api/vendor-analytics.api.js";

export function useVendorAnalytics(params = {}) {
  return useQuery({
    queryKey: ["vendors", "analytics", params],
    queryFn: () => getVendorAnalytics(params),
  });
}
