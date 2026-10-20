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
    return <p className="bg-gray-50 p-10 text-center text-sm text-gray-500">Loading product...</p>;
  }

  if (query.isError || !product) {
    const status = query.error?.response?.status;

    return (
      <main className="mx-auto min-h-screen max-w-3xl bg-gray-50 px-4 py-12 sm:p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {status === 404 ? "Product not found" : "Unable to load product"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {status === 404
              ? "This product may have been removed or is no longer available."
              : "Please check your connection and try again."}
          </p>

          <Link
            to="/products"
            className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const image = product.images?.[0];
  const price = Number(product.price);
  const compareAtPrice = Number(product.compareAtPrice);
  const stock = Number(product.stock);
  const hasDiscount = Number.isFinite(compareAtPrice) && compareAtPrice > price;

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/products" className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Product image */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-4">
          {image?.url ? (
            <img
              src={image.url}
              alt={image.alt || product.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm text-gray-400">No image available</span>
          )}
        </div>

        {/* Product information */}
        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {product.category?.name || "Products"}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold text-gray-900">
              ₹{Number.isFinite(price) ? price.toLocaleString("en-IN") : "—"}
            </span>

            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ₹{compareAtPrice.toLocaleString("en-IN")}
              </span>
            )}

            {hasDiscount && (
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                OFF
              </span>
            )}
          </div>

          {/* Rating */}
          {Number(product.ratingsCount) > 0 && (
            <p className="text-sm font-medium text-amber-600">
              ★ {Number(product.averageRating).toFixed(1)} (
              {product.ratingsCount} reviews)
            </p>
          )}

          {/* Description */}
          {product.description && (
            <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
              {product.description}
            </p>
          )}

          {/* Stock status */}
          <p
            className={
              stock > 0
                ? "text-sm font-semibold text-emerald-700"
                : "text-sm font-semibold text-red-600"
            }
          >
            {stock > 0 ? `${stock} in stock` : "Currently out of stock"}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
            <AddToCartButton product={product} />

            <WishlistButton productId={product._id} />
          </div>

          {/* Seller information */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Sold by</p>

            <p className="mt-1 font-semibold text-gray-900">
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