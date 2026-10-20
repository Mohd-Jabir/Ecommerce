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
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-sm text-gray-500">
        Loading orders...
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p role="alert" className="text-sm text-red-600">
          {query.error?.response?.data?.message || "Unable to load orders."}
        </p>
        <button
          onClick={() => query.refetch()}
          className="mt-3 text-sm font-medium text-orange-600 underline underline-offset-4 transition-colors hover:text-orange-700"
        >
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Customer orders
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label
            htmlFor="statusFilter"
            className="text-sm font-semibold text-gray-700"
          >
            Filter by status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {updateMutation.error?.response?.data?.message ||
              "Unable to update order status."}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
            No orders found.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Order
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Your items
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Order status
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Update status
                  </th>
                  <th className="whitespace-nowrap px-4 py-4 font-semibold">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition-colors hover:bg-orange-50/40"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900">
                      #{String(order._id).slice(-8)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {(order.vendorItems ?? order.items ?? []).reduce(
                        (sum, item) => sum + Number(item.quantity || 0),
                        0,
                      )}{" "}
                      item(s)
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                      {order.orderStatus}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.orderStatus}
                        disabled={
                          updateMutation.isPending ||
                          ["cancelled", "delivered"].includes(order.orderStatus)
                        }
                        onChange={(event) =>
                          changeStatus(order._id, event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-800 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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
                    <td className="px-4 py-4">
                      <Link
                        to={`/vendor/orders/${order._id}`}
                        className="font-semibold text-orange-600 underline-offset-4 transition-colors hover:text-orange-700 hover:underline"
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
