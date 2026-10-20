import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelOrder, getMyOrders } from "../../api/order.api.js";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

const statusClass = (status) => {
  if (status === "delivered") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "cancelled") {
    return "bg-red-50 text-red-700";
  }
  if (status === "shipped") {
    return "bg-blue-50 text-blue-700";
  }
  return "bg-orange-50 text-orange-700";
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyOrder, setBusyOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCancel = async (order) => {
    const confirmed = window.confirm(`Cancel order ${order.orderNumber}?`);

    if (!confirmed) return;

    setBusyOrder(order._id);
    setError("");

    try {
      const updated = await cancelOrder(order._id);

      setOrders((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to cancel this order.");
    } finally {
      setBusyOrder(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-20 pt-28 text-gray-900 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Your account
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
              My orders
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              View purchases and check their current status.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex w-fit rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-orange-500 hover:text-orange-600"
          >
            Continue shopping
          </Link>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              onClick={loadOrders}
              className="ml-3 font-semibold underline underline-offset-4 hover:text-red-900"
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
            <p className="mt-3 text-sm text-gray-500">
              When you place your first order, it will appear here.
            </p>
            <Link
              to="/products"
              className="mt-7 inline-flex rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
            >
              Discover products
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-7"
              >
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Order number
                    </p>
                    <h2 className="mt-1 font-semibold text-gray-900">
                      {order.orderNumber}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Placed {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusClass(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {money(order.total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 py-5">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${order._id}-${item.product || index}`}
                      className="flex items-center gap-4"
                    >
                      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-gray-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">Item</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Qty {item.quantity} · {money(item.unitPrice)} each
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        {money(item.lineTotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5">
                  <div className="text-sm text-gray-500">
                    Payment:{" "}
                    <span className="capitalize text-gray-700">
                      {order.paymentMethod}
                    </span>
                    {" · "}
                    <span className="capitalize text-gray-700">
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/orders/${order._id}`}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-orange-500 hover:text-orange-600"
                    >
                      View details
                    </Link>

                    {["processing", "confirmed"].includes(
                      order.orderStatus,
                    ) && (
                      <button
                        type="button"
                        disabled={busyOrder === order._id}
                        onClick={() => handleCancel(order)}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyOrder === order._id
                          ? "Cancelling..."
                          : "Cancel order"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}