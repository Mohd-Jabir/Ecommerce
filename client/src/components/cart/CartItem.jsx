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
    <article className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-center">
      <Link
        to={`/products/${product.slug}`}
        className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-card sm:w-28"
      >
        {image ? (
          <img
            src={image}
            alt={product.images?.[0]?.alt || product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm text-muted">No image</span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${product.slug}`}
          className="font-semibold text-foreground transition hover:text-primary"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-sm text-muted">{money(product.price)} each</p>

        {product.stock < item.quantity && (
          <p className="mt-2 text-sm text-red-600">
            Only {product.stock} currently available.
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(product._id)}
          className="mt-3 text-sm text-muted underline underline-offset-4 transition hover:text-foreground disabled:opacity-50"
        >
          Remove
        </button>
      </div>

      <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-xl border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={busy || item.quantity <= 1}
            onClick={() => onQuantityChange(product._id, item.quantity - 1)}
            className="px-3 py-2 text-foreground disabled:opacity-30"
          >
            −
          </button>

          <span className="min-w-8 text-center text-sm">{item.quantity}</span>

          <button
            type="button"
            aria-label="Increase quantity"
            disabled={busy || item.quantity >= Math.min(product.stock, 99)}
            onClick={() => onQuantityChange(product._id, item.quantity + 1)}
            className="px-3 py-2 text-foreground disabled:opacity-30"
          >
            +
          </button>
        </div>

        <p className="font-semibold text-foreground">
          {money(product.price * item.quantity)}
        </p>
      </div>
    </article>
  );
}
