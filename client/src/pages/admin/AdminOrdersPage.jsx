
import { useState } from "react";
import {
  useAdminOrders,
  useUpdateAdminOrderStatus,
} from "../../hooks/useAdmin";
import AdminTable from "../../components/admin/AdminTable";
import AdminPagination from "../../components/admin/AdminPagination";

const statuses = [
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const query = useAdminOrders({ page, limit: 20, search, status });
  const updateStatus = useUpdateAdminOrderStatus();

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const columns = [
    {
      key: "orderNumber",
      label: "Order",
      render: (order) => (
        <span className="font-semibold text-gray-900">
          {order.orderNumber ?? order._id ?? "—"}
        </span>
      ),
    },
    {
      key: "user",
      label: "Customer",
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900">
            {order.user?.name ?? "—"}
          </p>
          {order.user?.email && (
            <p className="mt-0.5 text-xs text-gray-500">
              {order.user.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (order) => (
        <span className="font-medium text-gray-900">
          {Number(order.total ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (order) => {
        const paymentStatus = order.paymentStatus ?? "pending";

        const paymentColors = {
          paid: "bg-green-100 text-green-700",
          pending: "bg-yellow-100 text-yellow-700",
          failed: "bg-red-100 text-red-700",
          refunded: "bg-gray-100 text-gray-700",
        };

        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              paymentColors[paymentStatus] ??
              "bg-gray-100 text-gray-700"
            }`}
          >
            {formatStatus(paymentStatus)}
          </span>
        );
      },
    },
    {
      key: "orderStatus",
      label: "Order status",
      render: (order) => {
        const orderStatus = order.orderStatus ?? "processing";

        const statusColors = {
          processing: "bg-blue-100 text-blue-700",
          confirmed: "bg-indigo-100 text-indigo-700",
          shipped: "bg-purple-100 text-purple-700",
          delivered: "bg-green-100 text-green-700",
          cancelled: "bg-red-100 text-red-700",
        };

        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              statusColors[orderStatus] ??
              "bg-gray-100 text-gray-700"
            }`}
          >
            {formatStatus(orderStatus)}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (order) =>
        order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "—",
    },
    {
      key: "actions",
      label: "Update status",
      render: (order) => {
        const finalStatus = ["delivered", "cancelled"].includes(
          order.orderStatus
        );

        return (
          <select
            aria-label={`Update status for order ${
              order.orderNumber ?? order._id
            }`}
            value={order.orderStatus ?? "processing"}
            disabled={finalStatus || updateStatus.isPending}
            onChange={(event) =>
              updateStatus.mutate({
                orderId: order._id,
                status: event.target.value,
              })
            }
            className="min-w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {formatStatus(value)}
              </option>
            ))}
          </select>
        );
      },
    },
  ];

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          Admin / Orders
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
          Orders
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          View orders, track payment status, and manage order progress.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="order-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search orders
            </label>
            <input
              id="order-search"
              type="search"
              value={search}
              placeholder="Search orders..."
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="order-status-filter"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Filter by status
            </label>
            <select
              id="order-status-filter"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All order statuses</option>
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Update status error */}
      {updateStatus.isError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {updateStatus.error?.message ||
            "Failed to update order status. Please try again."}
        </div>
      )}

      {/* Orders table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            All orders
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review order details and update eligible orders.
          </p>
        </div>

        <AdminTable
          columns={columns}
          rows={query.data?.items ?? []}
          loading={query.isPending}
          error={query.isError ? "Failed to load orders." : ""}
        />

        {!query.isPending &&
          !query.isError &&
          (query.data?.items ?? []).length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="font-medium text-gray-900">
                No orders found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          )}
      </div>

      {/* Pagination */}
      <AdminPagination
        pagination={query.data?.pagination}
        onPageChange={setPage}
      />
    </section>
  );
}
