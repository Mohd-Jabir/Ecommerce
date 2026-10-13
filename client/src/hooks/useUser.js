import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as userApi from "../api/user.api.js";

export const userKeys = {
  me: ["users", "me"],
  addresses: ["users", "me", "addresses"],
  address: (addressId) => ["users", "me", "addresses", addressId],
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

// Fetch all addresses
export function useMyAddresses() {
  return useQuery({
    queryKey: userKeys.addresses,
    queryFn: userApi.getMyAddresses,
  });
}

// Fetch a single address
export function useAddressById(addressId) {
  return useQuery({
    queryKey: userKeys.address(addressId),
    queryFn: () => userApi.getAddressById(addressId),
    enabled: Boolean(addressId),
  });
}
