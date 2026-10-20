import { Link } from "react-router-dom";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function CartItem({ item, onQuantityChange, onRemove, busy }) {
  const product = item.product;

  if (!product) return null;

  const image = product.images?.[0]?.url;

  return (
    <article className="flex flex-col gap-4 border-b border-gray-200 py-6 sm:flex-row sm:items-center">
      <Link
        to={`/products/${product.slug}`}
        className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50 sm:w-28"
      >
        {image ? (
          <img
            src={image}
            alt={product.images?.[0]?.alt || product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <span className="text-sm text-gray-400">No image</span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${product.slug}`}
          className="font-semibold text-gray-900 transition-colors duration-200 hover:text-orange-600"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-sm text-gray-500">
          {money(product.price)} each
        </p>

        {product.stock < item.quantity && (
          <p className="mt-2 text-sm text-red-600">
            Only {product.stock} currently available.
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(product._id)}
          className="mt-3 text-sm font-medium text-gray-500 underline underline-offset-4 transition-colors duration-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remove
        </button>
      </div>

      <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={busy || item.quantity <= 1}
            onClick={() => onQuantityChange(product._id, item.quantity - 1)}
            className="px-3 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>

          <span className="min-w-9 text-center text-sm font-medium text-gray-900">
            {item.quantity}
          </span>

          <button
            type="button"
            aria-label="Increase quantity"
            disabled={busy || item.quantity >= Math.min(product.stock, 99)}
            onClick={() => onQuantityChange(product._id, item.quantity + 1)}
            className="px-3 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>

        <p className="font-semibold text-gray-900">
          {money(product.price * item.quantity)}
        </p>
      </div>
    </article>
  );
}