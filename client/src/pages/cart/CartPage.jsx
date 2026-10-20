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
      <main className="min-h-screen bg-gray-50 px-4 pb-20 pt-28 text-gray-900 sm:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-9 w-48 rounded-lg bg-gray-200" />
          <div className="mt-8 h-48 rounded-2xl bg-white" />
          <div className="mt-4 h-48 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50 px-4 pb-20 pt-28 text-gray-900 sm:px-8 sm:pt-32">
      <div className="pointer-events-none absolute left-1/2 top-40 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-100/50 blur-[110px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Your selection
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Shopping cart
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={loadCart}
              className="ml-3 font-semibold underline underline-offset-4 transition-colors hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm sm:py-24">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-3xl text-orange-600">
              ♡
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Your cart is waiting
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              You haven't added anything yet. Explore the marketplace and
              find something you'll love.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Explore products
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-2xl border border-gray-200 bg-white px-5 shadow-sm sm:px-7">
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

            <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7 lg:sticky lg:top-28">
              <h2 className="text-xl font-bold text-gray-900">
                Order summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {money(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between gap-4 text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Final total is calculated by the server when you place
                    your order.
                  </p>
                </div>
              </div>

              {hasUnavailableItems && (
                <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">
                  Some items are unavailable or exceed current stock. Update
                  or remove them before checkout.
                </p>
              )}

              <button
                type="button"
                disabled={hasUnavailableItems || Boolean(busyProduct)}
                onClick={() => navigate("/checkout")}
                className="mt-7 w-full rounded-lg bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-orange-500"
              >
                Continue to checkout
              </button>

              <Link
                to="/products"
                className="mt-4 block text-center text-sm font-medium text-gray-500 transition-colors hover:text-orange-600"
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