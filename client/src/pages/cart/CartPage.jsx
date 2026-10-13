
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../../api/cart.api.js";
import CartItem from "../../components/cart/CartItem.jsx";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

function errorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [busyProduct, setBusyProduct] = useState(null);
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getCart();
      setCart(result || { items: [] });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (productId, quantity) => {
    setBusyProduct(productId);
    setError("");

    try {
      const updated = await updateCartItem(productId, quantity);
      setCart(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyProduct(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyProduct(productId);
    setError("");

    try {
      await removeCartItem(productId);
      await loadCart();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyProduct(null);
    }
  };

  const items = cart.items || [];

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const hasUnavailableItems = items.some(
    (item) =>
      !item.product ||
      item.product.status !== "active" ||
      item.product.stock < item.quantity,
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-page px-4 pb-20 pt-28 text-foreground sm:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-9 w-48 rounded-lg bg-card" />
          <div className="mt-8 h-48 rounded-2xl bg-card" />
          <div className="mt-4 h-48 rounded-2xl bg-card" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-page px-4 pb-20 pt-28 text-foreground sm:px-8 sm:pt-32">
      <div className="pointer-events-none absolute left-1/2 top-40 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[110px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Your selection
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Shopping cart
          </h1>

          <p className="mt-3 text-sm text-muted">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600"
          >
            {error}
            <button
              type="button"
              onClick={loadCart}
              className="ml-3 underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <section className="rounded-3xl border border-border bg-card/50 px-6 py-16 text-center sm:py-24">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-3xl">
              ♡
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              Your cart is waiting
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              You haven't added anything yet. Explore the marketplace and
              find something you'll love.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Explore products
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-3xl border border-border bg-card/30 px-5 sm:px-7">
              {items.map((item) => (
                <CartItem
                  key={item.product?._id || `${item._id}`}
                  item={item}
                  busy={busyProduct === item.product?._id}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </section>

            <aside className="rounded-3xl border border-border bg-card/50 p-6 sm:p-7 lg:sticky lg:top-28">
              <h2 className="text-xl font-semibold">Order summary</h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted">Shipping</span>
                  <span>Free</span>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between gap-4 text-base font-semibold">
                    <span>Total</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Final total is calculated by the server when you place
                    your order.
                  </p>
                </div>
              </div>

              {hasUnavailableItems && (
                <p className="mt-5 rounded-xl bg-red-500/5 p-3 text-sm text-red-600">
                  Some items are unavailable or exceed current stock. Update
                  or remove them before checkout.
                </p>
              )}

              <button
                type="button"
                disabled={hasUnavailableItems || Boolean(busyProduct)}
                onClick={() => navigate("/checkout")}
                className="mt-7 w-full rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue to checkout
              </button>

              <Link
                to="/products"
                className="mt-4 block text-center text-sm text-muted transition hover:text-foreground"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
