import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as productApi from "../api/product.api.js";

export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (params) => [...productKeys.lists(), params],
  detail: (slug) => [...productKeys.all, "detail", slug],
  reviews: (productId, params) => [
    ...productKeys.all,
    "reviews",
    productId,
    params,
  ],
};

export function useProducts(params = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.getProducts(params),
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productApi.getProductBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useProductReviews(productId, params = {}) {
  return useQuery({
    queryKey: productKeys.reviews(productId, params),
    queryFn: () => productApi.getProductReviews(productId, params),
    enabled: Boolean(productId),
  });
}

function useProductMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
      await options.onSuccess?.(...args);
    },
  });
}

export const useCreateProduct = () =>
  useProductMutation(productApi.createProduct);

export const useUpdateProduct = () =>
  useProductMutation(({ productId, payload }) =>
    productApi.updateProduct(productId, payload),
  );

export const useArchiveProduct = () =>
  useProductMutation(productApi.archiveProduct);
export function useMyProducts(params = {}) {
  return useQuery({
    queryKey: ["products", "mine", params],
    queryFn: () => productApi.getMyProducts(params),
  });
}