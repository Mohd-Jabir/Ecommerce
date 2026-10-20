import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useMyCategories,
  useDeactivateCategory,
} from "../../hooks/useCategory.js";

export default function CategoryManagementPage() {
  const [error, setError] = useState("");

  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useMyCategories();

  const deactivateMutation = useDeactivateCategory();

  async function handleDeactivate(categoryId) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this category?",
    );

    if (!confirmed) return;

    setError("");

    try {
      await deactivateMutation.mutateAsync(categoryId);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to deactivate category.",
      );
    }
  }

  if (isLoading) {
    return (
      <main className="p-6 text-sm text-gray-500">
        Loading your categories...
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 text-red-600">
        <p role="alert" className="text-sm">
          Unable to load your categories. Check your permissions and try again.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-sm font-medium underline underline-offset-4 transition-colors hover:text-red-800"
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Manage Categories
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Create and organize your own product categories.
          </p>
        </div>

        <Link
          to="/vendor/categories/new"
          className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          + Create Category
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="font-semibold text-gray-900">
            No categories found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You haven't created any categories yet.
          </p>

          <Link
            to="/vendor/categories/new"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Create your first category
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Category
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Description
                </th>

                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr
                  key={category._id}
                  className="transition-colors duration-150 hover:bg-orange-50/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-10 w-10 rounded-lg border border-gray-100 bg-gray-50 object-cover"
                        />
                      )}

                      <span className="font-semibold text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </td>

                  <td className="max-w-sm px-5 py-4 text-sm text-gray-600">
                    {category.description || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/vendor/categories/edit/${category._id}`}
                        state={{ category }}
                        className="text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={deactivateMutation.isPending}
                        onClick={() => handleDeactivate(category._id)}
                        className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deactivateMutation.isPending
                          ? "Deactivating..."
                          : "Deactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}