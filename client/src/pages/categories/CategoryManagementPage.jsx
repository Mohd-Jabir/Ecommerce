import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useCategories,
  useDeactivateCategory,
} from "../../hooks/useCategory.js";

export default function CategoryManagementPage() {
  const [error, setError] = useState("");
  const { data: categories = [], isLoading, isError } = useCategories();
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
      setError(err.response?.data?.message || "Unable to deactivate category.");
    }
  }

  if (isLoading) {
    return <main className="p-6">Loading categories...</main>;
  }

  if (isError) {
    return (
      <main className="p-6 text-red-600">
        Unable to load categories. Check your permissions and try again.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Categories
          </h1>
          <p className="mt-2 text-gray-600">
            Create and organize categories for your products.
          </p>
        </div>

        <Link
          to="/vendor/categories/new"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create Category
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-900">No categories found</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a category to organize your products.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Category
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Description
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category._id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <span className="font-medium text-gray-900">
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
                        className="text-sm font-medium text-indigo-600 hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={deactivateMutation.isPending}
                        onClick={() => handleDeactivate(category._id)}
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Deactivate
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
