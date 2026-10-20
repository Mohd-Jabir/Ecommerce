
import { Link, useParams } from "react-router-dom";
import { useVendorOrder } from "../../hooks/useVendorOrders.js";

export default function VendorOrderDetails() {
  const { orderId } = useParams();
  const query = useVendorOrder(orderId);

  if (query.isLoading) {
    return <main className="min-h-screen bg-gray-50 p-8 text-sm text-gray-500">Loading order...</main>;
  }

  if (query.isError) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p role="alert" className="text-sm text-red-600">
          {query.error?.response?.data?.message || "Unable to load order."}
        </p>
        <Link to="/vendor/orders" className="mt-3 inline-block text-sm font-medium text-orange-600 underline underline-offset-4 transition-colors hover:text-orange-700">
          Back to orders
        </Link>
      </main>
    );
  }

  const order = query.data;
  const items = order.vendorItems ?? order.items ?? [];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <Link to="/vendor/orders" className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">
          ← Back to orders
        </Link>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
          Order #{String(order._id).slice(-8)}
        </h1>

        <div className="mt-5 space-y-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          <p>Status: <strong className="font-semibold text-gray-900">{order.orderStatus}</strong></p>
          <p>Payment: <strong className="font-semibold text-gray-900">{order.paymentStatus}</strong></p>
          <p>Payment method: <strong className="font-semibold text-gray-900">{order.paymentMethod}</strong></p>
          <p>Date: {order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "—"}</p>
        </div>

        <h2 className="mt-8 text-lg font-semibold text-gray-900">Your products in this order</h2>

        <div className="mt-3 divide-y divide-gray-200">
          {items.map((item, index) => (
            <div
              key={item.product?._id ?? item.product ?? index}
              className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {Number(item.lineTotal ?? item.unitPrice * item.quantity)
                  .toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-sm leading-6 text-gray-500">
            The item list and item totals above are limited to this vendor's products.
          </p>
        </div>
      </div>
    </main>
  );
}