
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as productApi from "../api/vendor-products.api.js";

export const vendorProductKeys = {
  all: ["vendor-products"],
  lists: () => ["vendor-products", "list"],
  list: (params) => ["vendor-products", "list", params],
  detail: (id) => ["vendor-products", "detail", id],
};

export function useVendorProducts(params = {}) {
  return useQuery({
    queryKey: vendorProductKeys.list(params),
    queryFn: () => productApi.getVendorProducts(params),
  });
}

export function useVendorProduct(productId, options = {}) {
  return useQuery({
    queryKey: vendorProductKeys.detail(productId),
    queryFn: () => productApi.getVendorProduct(productId),
    enabled: Boolean(productId),
    ...options,
  });
}

function useProductMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vendorProductKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: ["vendors", "dashboard"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["vendors", "analytics"],
      });
    },
  });
}

export function useCreateVendorProduct() {
  return useProductMutation(productApi.createVendorProduct);
}

export function useUpdateVendorProduct() {
  return useProductMutation(productApi.updateVendorProduct);
}

export function useDeleteVendorProduct() {
  return useProductMutation(productApi.deleteVendorProduct);
}
