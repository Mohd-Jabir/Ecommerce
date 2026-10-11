import { Link } from "react-router-dom";

export default function ProductTable({
  products = [],
  onArchive,
  archivingId,
}) {
  if (!products.length) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h3 className="font-semibold text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a product or change your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product._id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.images?.[0]?.url || ""}
                    alt=""
                    className="h-12 w-12 rounded-lg bg-gray-100 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.category?.name || "Uncategorized"}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3">{product.sku}</td>

              <td className="px-4 py-3 font-medium">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </td>

              <td className="px-4 py-3">{product.stock}</td>

              <td className="px-4 py-3">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize">
                  {product.status}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    View
                  </Link>

                  <Link
                    to={`edit/${product._id}`}
                    state={{ product }}
                    className="font-medium text-gray-700 hover:underline"
                  >
                    Edit
                  </Link>

                  {onArchive && product.status !== "archived" && (
                    <button
                      type="button"
                      disabled={archivingId === product._id}
                      onClick={() => onArchive(product)}
                      className="font-medium text-red-600 disabled:opacity-50"
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
