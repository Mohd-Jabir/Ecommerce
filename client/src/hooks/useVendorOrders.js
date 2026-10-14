import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as orderApi from "../api/vendor-orders.api.js";

export const vendorOrderKeys = {
  all: ["vendor-orders"],
  list: (params) => ["vendor-orders", "list", params],
  detail: (id) => ["vendor-orders", "detail", id],
};

export function useVendorOrders(params = {}) {
  return useQuery({
    queryKey: vendorOrderKeys.list(params),
    queryFn: () => orderApi.getVendorOrders(params),
  });
}

export function useVendorOrder(orderId) {
  return useQuery({
    queryKey: vendorOrderKeys.detail(orderId),
    queryFn: () => orderApi.getVendorOrder(orderId),
    enabled: Boolean(orderId),
  });
}

export function useUpdateVendorOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.updateVendorOrderStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vendorOrderKeys.all,
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
