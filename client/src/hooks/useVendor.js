import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as vendorApi from "../api/vendor.api.js";

export const vendorKeys = {
  all: ["vendors"],
  me: ["vendors", "me"],
  dashboard: ["vendors", "dashboard"],
};

export function useMyVendorProfile(options = {}) {
  return useQuery({
    queryKey: vendorKeys.me,
    queryFn: vendorApi.getMyVendorProfile,
    retry: (failureCount, error) => {
      if ([401, 403, 404].includes(error?.response?.status)) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}

export function useVendorDashboard(options = {}) {
  return useQuery({
    queryKey: vendorKeys.dashboard,
    queryFn: vendorApi.getVendorDashboard,
    retry: (failureCount, error) => {
      if ([401, 403, 404].includes(error?.response?.status)) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
}

export function useVendorMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vendorKeys.me }),
        queryClient.invalidateQueries({
          queryKey: vendorKeys.dashboard,
        }),
      ]);
    },
  });
}

export function useApplyToBecomeVendor() {
  return useVendorMutation(vendorApi.applyToBecomeVendor);
}

export function useUpdateVendorProfile() {
  return useVendorMutation(vendorApi.updateMyVendorProfile);
}
