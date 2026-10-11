import { Link, useParams } from "react-router-dom";
import { useProduct } from "../../hooks/useProduct.js";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const query = useProduct(slug);
  const product = query.data;

  if (query.isPending) {
    return <p className="p-10 text-center">Loading product...</p>;
  }

  if (query.isError) {
    const status = query.error?.response?.status;

    return (
      <main className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="text-2xl font-bold">
          {status === 404 ? "Product not found" : "Unable to load product"}
        </h1>
        <p className="mt-2 text-gray-500">
          {status === 404
            ? "This product may have been removed or is no longer available."
            : "Please check your connection and try again."}
        </p>
        <Link
          to="/products"
          className="mt-5 inline-block text-indigo-600 hover:underline"
        >
          Back to products
        </Link>
      </main>
    );
  }

  const image = product.images?.[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/products" className="text-sm text-indigo-600 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-100">
          {image?.url ? (
            <img
              src={image.url}
              alt={image.alt || product.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-gray-400">No image available</span>
          )}
        </div>

        <section className="space-y-5">
          <div>
            <p className="text-sm text-gray-500">
              {product.category?.name || "Products"}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-gray-400 line-through">
                ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {product.ratingsCount > 0 && (
            <p className="text-sm text-amber-600">
              ★ {Number(product.averageRating).toFixed(1)} (
              {product.ratingsCount} reviews)
            </p>
          )}

          <p className="whitespace-pre-line leading-7 text-gray-600">
            {product.description}
          </p>

          <p
            className={
              product.stock > 0
                ? "text-sm text-green-700"
                : "text-sm text-red-600"
            }
          >
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Currently out of stock"}
          </p>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Sold by</p>
            <p className="font-medium">
              {product.vendor?.storeName || "Marketplace seller"}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
