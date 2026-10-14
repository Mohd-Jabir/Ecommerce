import { Link, useParams } from "react-router-dom";

import { useProduct } from "../../hooks/useProduct.js";
import AddToCartButton from "../../components/cart/AddToCartButton.jsx";
import ProductReviews from "../../components/products/ProductReviews.jsx";
import WishlistButton from "../../components/wishlist/WishlistButton.jsx";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const query = useProduct(slug);
  const product = query.data;

  if (query.isPending) {
    return <p className="p-10 text-center">Loading product...</p>;
  }

  if (query.isError || !product) {
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
  const price = Number(product.price);
  const compareAtPrice = Number(product.compareAtPrice);
  const stock = Number(product.stock);
  const hasDiscount = Number.isFinite(compareAtPrice) && compareAtPrice > price;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/products" className="text-sm text-indigo-600 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {/* Product image */}
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

        {/* Product information */}
        <section className="space-y-5">
          <div>
            <p className="text-sm text-gray-500">
              {product.category?.name || "Products"}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold text-gray-900">
              ₹{Number.isFinite(price) ? price.toLocaleString("en-IN") : "—"}
            </span>

            {hasDiscount && (
              <span className="text-gray-400 line-through">
                ₹{compareAtPrice.toLocaleString("en-IN")}
              </span>
            )}

            {hasDiscount && (
              <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                OFF
              </span>
            )}
          </div>

          {/* Rating */}
          {Number(product.ratingsCount) > 0 && (
            <p className="text-sm text-amber-600">
              ★ {Number(product.averageRating).toFixed(1)} (
              {product.ratingsCount} reviews)
            </p>
          )}

          {/* Description */}
          {product.description && (
            <p className="whitespace-pre-line leading-7 text-gray-600">
              {product.description}
            </p>
          )}

          {/* Stock status */}
          <p
            className={
              stock > 0
                ? "text-sm font-medium text-green-700"
                : "text-sm font-medium text-red-600"
            }
          >
            {stock > 0 ? `${stock} in stock` : "Currently out of stock"}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <AddToCartButton product={product} />

            <WishlistButton productId={product._id} />
          </div>

          {/* Seller information */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Sold by</p>

            <p className="font-medium text-gray-900">
              {product.vendor?.storeName || "Marketplace seller"}
            </p>
          </div>
        </section>
      </div>

      {/* Product reviews */}
      <section className="mt-12 border-t border-gray-200 pt-8">
        <ProductReviews productId={product._id} />
      </section>
    </main>
  );
}
