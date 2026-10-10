import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as userApi from "../api/user.api.js";

export const userKeys = {
  me: ["users", "me"],
};

export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: userApi.getMyProfile,
  });
}

export function useUserMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.me });
      await options.onSuccess?.(...args);
    },
  });
}

export const useUpdateMyProfile = () =>
  useUserMutation(userApi.updateMyProfile);

export const useAddAddress = () => useUserMutation(userApi.addAddress);

export const useUpdateAddress = () =>
  useUserMutation(({ addressId, payload }) =>
    userApi.updateAddress(addressId, payload),
  );

export const useDeleteAddress = () => useUserMutation(userApi.deleteAddress);

export const useSetDefaultAddress = () =>
  useUserMutation(userApi.setDefaultAddress);

export function useDeactivateMyAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deactivateMyAccount,
    onSuccess: () => queryClient.clear(),
  });
}
