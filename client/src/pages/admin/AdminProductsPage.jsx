
import { useState } from "react";
import {
  useAdminProducts,
  useUpdateAdminProductStatus,
  useDeleteAdminProduct,
} from "../../hooks/useAdmin";
import AdminTable from "../../components/admin/AdminTable";
import AdminPagination from "../../components/admin/AdminPagination";

const statuses = ["draft", "active", "archived"];

const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const query = useAdminProducts({ page, limit: 20, search, status });
  const updateStatus = useUpdateAdminProductStatus();
  const deleteProduct = useDeleteAdminProduct();

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const columns = [
    {
      key: "name",
      label: "Product",
      render: (product) => (
        <span className="font-semibold text-gray-900">
          {product.name ?? "—"}
        </span>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      render: (product) => (
        <span className="text-sm text-gray-600">
          {product.sku || "—"}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (product) => (
        <span className="font-medium text-gray-900">
          {Number(product.price ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (product) => {
        const stock = Number(product.stock ?? 0);

        return (
          <span
            className={`font-medium ${
              stock <= 0
                ? "text-red-600"
                : stock <= 5
                  ? "text-amber-600"
                  : "text-gray-700"
            }`}
          >
            {product.stock ?? 0}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (product) => {
        const statusColors = {
          active: "bg-green-100 text-green-700",
          draft: "bg-gray-100 text-gray-700",
          archived: "bg-amber-100 text-amber-700",
        };

        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              statusColors[product.status] ??
              "bg-gray-100 text-gray-700"
            }`}
          >
            {formatStatus(product.status ?? "draft")}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (product) => (
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={`Status for ${product.name}`}
            value={product.status ?? "draft"}
            disabled={updateStatus.isPending}
            onChange={(event) =>
              updateStatus.mutate({
                productId: product._id,
                status: event.target.value,
              })
            }
            className="min-w-28 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {formatStatus(value)}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={deleteProduct.isPending}
            onClick={() => {
              if (window.confirm(`Delete ${product.name}?`)) {
                deleteProduct.mutate(product._id);
              }
            }}
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteProduct.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          Admin / Products
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
          Products
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your product catalog, inventory, and product status.
        </p>
      </div>

      {/* Search and filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="product-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search products
            </label>

            <input
              id="product-search"
              type="search"
              value={search}
              placeholder="Search products..."
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="product-status"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Filter by status
            </label>

            <select
              id="product-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All statuses</option>

              {statuses.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mutation errors */}
      {(updateStatus.isError || deleteProduct.isError) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {updateStatus.error?.message ||
            deleteProduct.error?.message ||
            "Product action failed. Please try again."}
        </div>
      )}

      {/* Products table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            All products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update product status or remove products from your catalog.
          </p>
        </div>

        <AdminTable
          columns={columns}
          rows={query.data?.items ?? []}
          loading={query.isPending}
          error={query.isError ? "Failed to load products." : ""}
        />

        {!query.isPending &&
          !query.isError &&
          (query.data?.items ?? []).length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="font-medium text-gray-900">
                No products found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          )}
      </div>

      {/* Pagination */}
      <AdminPagination
        pagination={query.data?.pagination}
        onPageChange={setPage}
      />
    </section>
  );
}
