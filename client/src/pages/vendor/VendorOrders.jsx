import { Link } from "react-router-dom";
import { useState } from "react";
import {
  useVendorOrders,
  useUpdateVendorOrderStatus,
} from "../../hooks/useVendorOrders.js";

const statuses = ["processing", "confirmed", "shipped", "delivered"];

export default function VendorOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const query = useVendorOrders({
    page: 1,
    limit: 50,
    ...(statusFilter ? { orderStatus: statusFilter } : {}),
  });

  const updateMutation = useUpdateVendorOrderStatus();

  if (query.isLoading) {
    return <main className="p-8">Loading orders...</main>;
  }

  if (query.isError) {
    return (
      <main className="p-8">
        <p role="alert">
          {query.error?.response?.data?.message || "Unable to load orders."}
        </p>
        <button onClick={() => query.refetch()} className="mt-3 underline">
          Retry
        </button>
      </main>
    );
  }

  const result = query.data;
  const orders = Array.isArray(result) ? result : (result?.orders ?? []);

  function changeStatus(orderId, orderStatus) {
    updateMutation.mutate({ orderId, orderStatus });
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold">Customer orders</h1>

        <div className="mt-5">
          <label htmlFor="statusFilter" className="mr-3 text-sm font-medium">
            Filter by status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border bg-white px-3 py-2"
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
            <option value="cancelled">cancelled</option>
          </select>
        </div>

        {updateMutation.isError && (
          <p role="alert" className="mt-4 text-red-600">
            {updateMutation.error?.response?.data?.message ||
              "Unable to update order status."}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-white p-8">
            No orders found.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Your items</th>
                  <th className="p-4">Order status</th>
                  <th className="p-4">Update status</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t">
                    <td className="p-4 font-medium">
                      #{String(order._id).slice(-8)}
                    </td>
                    <td className="p-4">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-4">
                      {(order.vendorItems ?? order.items ?? []).reduce(
                        (sum, item) => sum + Number(item.quantity || 0),
                        0,
                      )}{" "}
                      item(s)
                    </td>
                    <td className="p-4">{order.orderStatus}</td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        disabled={
                          updateMutation.isPending ||
                          ["cancelled", "delivered"].includes(order.orderStatus)
                        }
                        onChange={(event) =>
                          changeStatus(order._id, event.target.value)
                        }
                        className="rounded border p-2"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                        {order.orderStatus === "cancelled" && (
                          <option value="cancelled">cancelled</option>
                        )}
                        {order.orderStatus === "delivered" && (
                          <option value="delivered">delivered</option>
                        )}
                      </select>
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/vendor/orders/${order._id}`}
                        className="underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
