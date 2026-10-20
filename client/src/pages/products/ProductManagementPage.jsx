import { useState } from "react";
import { Link } from "react-router-dom";

import ProductFilters from "../../components/products/ProductFilters.jsx";
import ProductTable from "../../components/products/ProductTable.jsx";
import ProductPagination from "../../components/products/ProductPagination.jsx";
import DeleteProductDialog from "../../components/products/DeleteProductDialog.jsx";

import { useCategories } from "../../hooks/useCategory.js";
import {
  useProducts,
  useMyProducts,
  useArchiveProduct,
} from "../../hooks/useProduct.js";

export default function ProductManagementPage({ mode = "vendor" }) {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    page: 1,
    limit: 20,
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value != null,
    ),
  );

  // Admins see all products; vendors see only their own products.
  const productsQuery =
    mode === "admin"
      ? useProducts(params)
      : useMyProducts(params);

  const categoriesQuery = useCategories();
  const archiveMutation = useArchiveProduct();

  const result = productsQuery.data;
  const products = result?.products ?? [];
  const pagination = result?.pagination ?? {};

  async function confirmArchive() {
    if (!selectedProduct) return;

    try {
      await archiveMutation.mutateAsync(selectedProduct._id);
      setSelectedProduct(null);
    } catch {
      // Keep the dialog open so the user can retry.
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {mode === "admin" ? "Manage all products" : "My products"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Search, edit, and archive products.
          </p>
        </div>

        <Link
          to="new"
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          + Add product
        </Link>
      </header>

      {categoriesQuery.isError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Could not load categories.
          <button
            type="button"
            onClick={() => categoriesQuery.refetch()}
            className="ml-2 font-semibold underline underline-offset-4 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      <ProductFilters
        filters={filters}
        onChange={setFilters}
        categories={categoriesQuery.data ?? []}
      />

      {productsQuery.isPending ? (
        <p className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
          Loading products...
        </p>
      ) : productsQuery.isError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Could not load products.
          <button
            type="button"
            onClick={() => productsQuery.refetch()}
            className="ml-2 font-semibold underline underline-offset-4 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <ProductTable
            products={products}
            onArchive={setSelectedProduct}
            archivingId={
              archiveMutation.isPending
                ? selectedProduct?._id
                : null
            }
          />

          <ProductPagination
            page={pagination.page ?? filters.page}
            totalPages={pagination.totalPages ?? 1}
            onPageChange={(page) =>
              setFilters((current) => ({ ...current, page }))
            }
          />
        </>
      )}

      {archiveMutation.isError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {archiveMutation.error?.response?.data?.message ||
            "Could not archive product. Please try again."}
        </p>
      )}

      <DeleteProductDialog
        product={selectedProduct}
        isPending={archiveMutation.isPending}
        onCancel={() => setSelectedProduct(null)}
        onConfirm={confirmArchive}
      />
    </main>
  );
}