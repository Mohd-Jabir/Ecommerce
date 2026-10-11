import { useState } from "react";
import ProductCard from "../../components/products/ProductCard.jsx";
import ProductFilters from "../../components/products/ProductFilters.jsx";
import ProductPagination from "../../components/products/ProductPagination.jsx";
import { useProducts } from "../../hooks/useProduct.js";
import { useCategories } from "../../hooks/useCategory.js";

export default function ProductListPage() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    page: 1,
    limit: 12,
  });

  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value != null,
    ),
  );

  const productsQuery = useProducts(params);
  const categoriesQuery = useCategories();

  const result = productsQuery.data;
  const products = result?.products ?? [];
  const pagination = result?.pagination ?? {};

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Shop products</h1>
        <p className="mt-2 text-gray-500">
          Browse products from our marketplace.
        </p>
      </header>

      <ProductFilters
        filters={filters}
        onChange={setFilters}
        categories={categoriesQuery.data ?? []}
      />

      {productsQuery.isPending ? (
        <p className="py-12 text-center text-gray-500">Loading products...</p>
      ) : productsQuery.isError ? (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          Could not load products. Please try again.
          <button
            type="button"
            onClick={() => productsQuery.refetch()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="font-semibold">No products found</h2>
          <p className="mt-1 text-sm text-gray-500">
            Try different search terms or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <ProductPagination
            page={pagination.page ?? filters.page}
            totalPages={pagination.totalPages ?? 1}
            onPageChange={(page) =>
              setFilters((current) => ({ ...current, page }))
            }
          />
        </>
      )}
    </main>
  );
}
