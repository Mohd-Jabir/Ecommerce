import { Link } from "react-router-dom";
import {
  useVendorProducts,
  useDeleteVendorProduct,
} from "../../hooks/useVendorProducts.js";

export default function VendorProducts() {
  const productsQuery = useVendorProducts({ page: 1, limit: 50 });
  const deleteMutation = useDeleteVendorProduct();

  if (productsQuery.isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-sm text-gray-500">
        Loading products...
      </main>
    );
  }

  if (productsQuery.isError) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p role="alert" className="text-sm text-red-600">
          {productsQuery.error?.response?.data?.message ||
            "Unable to load products."}
        </p>
        <button
          onClick={() => productsQuery.refetch()}
          className="mt-3 text-sm font-medium text-orange-600 underline underline-offset-4 transition-colors hover:text-orange-700"
        >
          Retry
        </button>
      </main>
    );
  }

  const result = productsQuery.data;
  const products = Array.isArray(result) ? result : (result?.products ?? []);

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    deleteMutation.mutate(product._id);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My products
          </h1>
          <Link
            to="/vendor/products/new"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            + Add product
          </Link>
        </div>

        {deleteMutation.isError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {deleteMutation.error?.response?.data?.message ||
              "Unable to delete product."}
          </p>
        )}

        {products.length === 0 ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-600">
              You haven't added any products yet.
            </p>
            <Link
              to="/vendor/products/new"
              className="mt-3 inline-block text-sm font-semibold text-orange-600 underline-offset-4 transition-colors hover:text-orange-700 hover:underline"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Product
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    SKU
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Price
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Stock
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="transition-colors hover:bg-orange-50/40"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-12 w-12 rounded-lg border border-gray-200 bg-gray-50 object-cover"
                          />
                        )}
                        <span className="font-semibold text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                      {product.sku}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                      {Number(product.price).toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{product.stock}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {product.status}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/vendor/products/${product._id}/edit`}
                          className="font-medium text-orange-600 underline-offset-4 transition-colors hover:text-orange-700 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleteMutation.isPending}
                          className="font-medium text-red-600 underline-offset-4 transition-colors hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
