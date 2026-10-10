import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as vendorApi from "../api/vendor.api.js";

export const vendorKeys = {
  me: ["vendors", "me"],
};

export function useMyVendorProfile(options = {}) {
  return useQuery({
    queryKey: vendorKeys.me,
    queryFn: vendorApi.getMyVendorProfile,
    retry: (failureCount, error) => {
      if (error.response?.status === 404) return false;
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
      await queryClient.invalidateQueries({
        queryKey: vendorKeys.me,
      });
    },
  });
}

export function useApplyToBecomeVendor() {
  return useVendorMutation(vendorApi.applyToBecomeVendor);
}

export function useUpdateVendorProfile() {
  return useVendorMutation(vendorApi.updateMyVendorProfile);
}
