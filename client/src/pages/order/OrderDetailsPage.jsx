import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../../api/order.api.js";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getOrderById(orderId)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err?.response?.data?.message || "Unable to load this order.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-page px-4 pt-32 text-foreground">
        Loading order...
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-page px-4 pt-32 text-foreground">
        <p role="alert" className="text-red-600">
          {error || "Order not found."}
        </p>
        <Link to="/orders" className="mt-5 inline-block underline">
          Back to orders
        </Link>
      </main>
    );
  }

  const address = order.shippingAddress || {};

  return (
    <main className="min-h-screen bg-page px-4 pb-20 pt-28 text-foreground sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-4xl">
        <Link to="/orders" className="text-sm text-muted hover:text-foreground">
          ← Back to orders
        </Link>

        <header className="mt-7">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Order details
          </p>
          <h1 className="mt-3 break-words text-3xl font-semibold sm:text-4xl">
            {order.orderNumber}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Placed {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-border bg-card/30 p-6">
            <h2 className="font-semibold">Delivery address</h2>
            <div className="mt-4 space-y-1 text-sm leading-6 text-muted">
              <p className="font-medium text-foreground">{address.fullName}</p>
              <p>{address.phone}</p>
              <p>{address.addressLine1}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              <p>
                {[address.city, address.state, address.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{address.country}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card/30 p-6">
            <h2 className="font-semibold">Order status</h2>
            <p className="mt-4 text-sm text-muted">
              Order:{" "}
              <span className="capitalize text-foreground">
                {order.orderStatus}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted">
              Payment:{" "}
              <span className="capitalize text-foreground">
                {order.paymentMethod}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted">
              Payment status:{" "}
              <span className="capitalize text-foreground">
                {order.paymentStatus}
              </span>
            </p>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-border bg-card/30 p-5 sm:p-7">
          <h2 className="text-xl font-semibold">Items ordered</h2>

          <div className="mt-5 divide-y divide-border">
            {order.items?.map((item, index) => (
              <div
                key={`${item.product || index}`}
                className="flex items-center gap-4 py-4"
              >
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-card">
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
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {money(item.unitPrice)} × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">{money(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          <div className="ml-auto mt-5 max-w-sm space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted">Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">Shipping</span>
              <span>{money(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
