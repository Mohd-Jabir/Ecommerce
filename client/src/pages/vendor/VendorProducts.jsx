import { Link } from "react-router-dom";
import {
  useVendorProducts,
  useDeleteVendorProduct,
} from "../../hooks/useVendorProducts.js";

export default function VendorProducts() {
  const productsQuery = useVendorProducts({ page: 1, limit: 50 });
  const deleteMutation = useDeleteVendorProduct();

  if (productsQuery.isLoading) {
    return <main className="p-8">Loading products...</main>;
  }

  if (productsQuery.isError) {
    return (
      <main className="p-8">
        <p role="alert">
          {productsQuery.error?.response?.data?.message ||
            "Unable to load products."}
        </p>
        <button
          onClick={() => productsQuery.refetch()}
          className="mt-3 underline"
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
          <h1 className="text-2xl font-bold">My products</h1>
          <Link
            to="/vendor/products/new"
            className="rounded-lg bg-gray-900 px-4 py-3 text-white"
          >
            + Add product
          </Link>
        </div>

        {deleteMutation.isError && (
          <p role="alert" className="mt-4 text-red-600">
            {deleteMutation.error?.response?.data?.message ||
              "Unable to delete product."}
          </p>
        )}

        {products.length === 0 ? (
          <div className="mt-8 rounded-xl border bg-white p-8 text-center">
            <p>You haven't added any products yet.</p>
            <Link
              to="/vendor/products/new"
              className="mt-3 inline-block underline"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{product.sku}</td>
                    <td className="p-4">
                      {Number(product.price).toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">{product.status}</td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <Link
                          to={`/vendor/products/${product._id}/edit`}
                          className="underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 underline disabled:opacity-50"
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
