import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as categoryApi from "../api/category.api.js";

export const categoryKeys = {
  all: ["categories"],
  list: () => [...categoryKeys.all, "list"],
  detail: (slug) => [...categoryKeys.all, "detail", slug],
};

export function useCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: categoryApi.getCategories,
    ...options,
  });
}

export function useCategory(slug) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => categoryApi.getCategoryBySlug(slug),
    enabled: Boolean(slug),
  });
}

function useCategoryMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
      await options.onSuccess?.(...args);
    },
  });
}

export const useCreateCategory = () =>
  useCategoryMutation(categoryApi.createCategory);

export const useUpdateCategory = () =>
  useCategoryMutation(({ categoryId, payload }) =>
    categoryApi.updateCategory(categoryId, payload),
  );

export const useDeactivateCategory = () =>
  useCategoryMutation(categoryApi.deactivateCategory);
