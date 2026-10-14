import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../api/wishlist.api.js";

export const wishlistQueryKey = ["wishlist"];

export function useWishlist() {
  return useQuery({
    queryKey: wishlistQueryKey,
    queryFn: getWishlist,
    retry: false,
  });
}

export function useWishlistMutation() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: wishlistQueryKey,
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: wishlistQueryKey,
      });
    },
  });

  return { addMutation, removeMutation };
}
