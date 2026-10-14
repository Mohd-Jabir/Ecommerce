
import { Link, useParams } from "react-router-dom";
import { useVendorOrder } from "../../hooks/useVendorOrders.js";

export default function VendorOrderDetails() {
  const { orderId } = useParams();
  const query = useVendorOrder(orderId);

  if (query.isLoading) {
    return <main className="p-8">Loading order...</main>;
  }

  if (query.isError) {
    return (
      <main className="p-8">
        <p role="alert">
          {query.error?.response?.data?.message || "Unable to load order."}
        </p>
        <Link to="/vendor/orders" className="mt-3 inline-block underline">
          Back to orders
        </Link>
      </main>
    );
  }

  const order = query.data;
  const items = order.vendorItems ?? order.items ?? [];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6">
        <Link to="/vendor/orders" className="text-sm underline">
          ← Back to orders
        </Link>

        <h1 className="mt-5 text-2xl font-bold">
          Order #{String(order._id).slice(-8)}
        </h1>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p>Status: <strong>{order.orderStatus}</strong></p>
          <p>Payment: <strong>{order.paymentStatus}</strong></p>
          <p>Payment method: <strong>{order.paymentMethod}</strong></p>
          <p>Date: {order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "—"}</p>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Your products in this order</h2>

        <div className="mt-3 divide-y">
          {items.map((item, index) => (
            <div key={item.product?._id ?? item.product ?? index}
              className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {Number(item.lineTotal ?? item.unitPrice * item.quantity)
                  .toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500">
            The item list and item totals above are limited to this vendor's products.
          </p>
        </div>
      </div>
    </main>
  );
}
