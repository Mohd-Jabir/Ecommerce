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
    return "bg-emerald-500/10 text-emerald-600";
  }
  if (status === "cancelled") {
    return "bg-red-500/10 text-red-600";
  }
  if (status === "shipped") {
    return "bg-blue-500/10 text-blue-600";
  }
  return "bg-primary/10 text-primary";
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
    <main className="min-h-screen bg-page px-4 pb-20 pt-28 text-foreground sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Your account
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              My orders
            </h1>
            <p className="mt-3 text-sm text-muted">
              View purchases and check their current status.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex w-fit rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-card"
          >
            Continue shopping
          </Link>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl bg-red-500/5 p-4 text-sm text-red-600"
          >
            {error}
            <button
              onClick={loadOrders}
              className="ml-3 underline"
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
                className="h-36 animate-pulse rounded-2xl bg-card"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <section className="rounded-3xl border border-border bg-card/30 px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold">No orders yet</h2>
            <p className="mt-3 text-sm text-muted">
              When you place your first order, it will appear here.
            </p>
            <Link
              to="/products"
              className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background"
            >
              Discover products
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-3xl border border-border bg-card/30 p-5 sm:p-7"
              >
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">
                      Order number
                    </p>
                    <h2 className="mt-1 font-semibold">{order.orderNumber}</h2>
                    <p className="mt-2 text-sm text-muted">
                      Placed {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusClass(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-lg font-semibold">
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
                      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-card">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted">Item</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Qty {item.quantity} · {money(item.unitPrice)} each
                        </p>
                      </div>

                      <p className="text-sm font-medium">
                        {money(item.lineTotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                  <div className="text-sm text-muted">
                    Payment:{" "}
                    <span className="capitalize">{order.paymentMethod}</span>
                    {" · "}
                    <span className="capitalize">{order.paymentStatus}</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/orders/${order._id}`}
                      className="rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-card"
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
                        className="rounded-full border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-500/5 disabled:opacity-50"
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
