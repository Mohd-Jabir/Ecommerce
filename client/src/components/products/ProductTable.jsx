import { Link } from "react-router-dom";

export default function ProductTable({
  products = [],
  onArchive,
  archivingId,
}) {
  if (!products.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <h3 className="font-semibold text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a product or change your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3.5 font-semibold">Product</th>
            <th className="px-4 py-3.5 font-semibold">SKU</th>
            <th className="px-4 py-3.5 font-semibold">Price</th>
            <th className="px-4 py-3.5 font-semibold">Stock</th>
            <th className="px-4 py-3.5 font-semibold">Status</th>
            <th className="px-4 py-3.5 font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr
              key={product._id}
              className="transition-colors duration-150 hover:bg-orange-50/40"
            >
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={product.images?.[0]?.url || ""}
                    alt=""
                    className="h-12 w-12 rounded-lg border border-gray-100 bg-gray-50 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {product.category?.name || "Uncategorized"}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3.5 text-gray-600">{product.sku}</td>

              <td className="px-4 py-3.5 font-semibold text-gray-900">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </td>

              <td className="px-4 py-3.5 text-gray-700">{product.stock}</td>

              <td className="px-4 py-3.5">
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                  {product.status}
                </span>
              </td>

              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                  >
                    View
                  </Link>

                  <Link
                    to={`edit/${product._id}`}
                    state={{ product }}
                    className="font-medium text-gray-600 transition-colors hover:text-gray-900 hover:underline"
                  >
                    Edit
                  </Link>

                  {onArchive && product.status !== "archived" && (
                    <button
                      type="button"
                      disabled={archivingId === product._id}
                      onClick={() => onArchive(product)}
                      className="font-medium text-red-600 transition-colors hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {archivingId === product._id ? "Archiving..." : "Archive"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}