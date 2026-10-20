
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as productApi from "../api/product.api.js";

export const productKeys = {
  all: ["products"],
  lists: () => ["products", "list"],
  list: (params) => ["products", "list", params],
  myLists: () => ["products", "mine"],
  myList: (params) => ["products", "mine", params],
  detail: (slug) => ["products", "detail", slug],
  reviews: (productId, params) => [
    "products",
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

export function useMyProducts(params = {}) {
  return useQuery({
    queryKey: productKeys.myList(params),
    queryFn: () => productApi.getMyProducts(params),
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
    ...options,
    mutationFn,
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
