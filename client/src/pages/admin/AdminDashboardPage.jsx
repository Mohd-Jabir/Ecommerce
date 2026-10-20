import { useAdminDashboard } from "../../hooks/useAdmin";
import { Link } from "react-router-dom";
const statCards = [
  {
    label: "Total users",
    key: "totalUsers",
    color: "bg-orange-50 text-orange-700",
  },
  {
    label: "Active users",
    key: "activeUsers",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Suspended users",
    key: "suspendedUsers",
    color: "bg-red-50 text-red-700",
  },
  {
    label: "Total vendors",
    key: "totalVendors",
    color: "bg-amber-50 text-amber-700",
  },
  {
    label: "Pending vendors",
    key: "pendingVendors",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    label: "Total products",
    key: "totalProducts",
    color: "bg-orange-50 text-orange-700",
  },
  {
    label: "Active products",
    key: "activeProducts",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Total orders",
    key: "totalOrders",
    color: "bg-gray-100 text-gray-700",
  },
  {
    label: "Pending orders",
    key: "pendingOrders",
    color: "bg-amber-50 text-amber-700",
  },
  {
    label: "Total reviews",
    key: "totalReviews",
    color: "bg-gray-100 text-gray-700",
  },
  {
    label: "Pending reviews",
    key: "pendingReviews",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    label: "Total categories",
    key: "totalCategories",
    color: "bg-gray-100 text-gray-700",
  },
  {
    label: "Active categories",
    key: "activeCategories",
    color: "bg-emerald-50 text-emerald-700",
  },
];

function StatusBadge({ value }) {
  const styles = {
    processing: "bg-amber-50 text-amber-700",
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-orange-50 text-orange-700",
    shipped: "bg-gray-100 text-gray-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
    paid: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
    refunded: "bg-orange-50 text-orange-700",
  };

  const label = value || "—";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[String(label).toLowerCase()] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}

export default function AdminDashboardPage() {
  const query = useAdminDashboard();

  if (query.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
          <p className="text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        <h2 className="font-semibold">Unable to load dashboard</h2>
        <p className="mt-1">
          Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Try again
        </button>
      </div>
    );
  }

  const dashboard = query.data?.data;
  const counts = dashboard?.counts ?? {};
  const recentOrders = dashboard?.recentOrders ?? [];

  return (
    <section className="space-y-8">
      
     {/* Page heading */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <p className="text-sm font-medium text-orange-600">
      Store management
    </p>
    <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
      Dashboard
    </h1>
    <p className="mt-2 text-sm text-gray-500">
      Overview of your store performance and recent activity.
    </p>
  </div>

  <Link
    to="/"
    className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
  >
    <span aria-hidden="true">←</span>
    Back to Home
  </Link>
</div>
      {/* Statistics */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Store overview
          </h2>
          <span className="text-xs font-medium text-gray-500">
            Live summary
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <article
              key={card.key}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                <span
                  className={`rounded-lg px-2 py-1 text-xs font-semibold ${card.color}`}
                >
                  Overview
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                {counts[card.key] ?? 0}
              </p>
            </article>
          ))}

          {/* Revenue */}
          <article className="rounded-xl border border-orange-200 bg-orange-500 p-5 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md">
            <p className="text-sm font-medium text-orange-50">
              Paid revenue
            </p>
            <p className="mt-4 text-3xl font-bold tracking-tight">
              {Number(dashboard?.revenue ?? 0).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>
            <p className="mt-2 text-xs text-orange-100">
              Revenue reported by the dashboard API
            </p>
          </article>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent orders
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest orders placed in your store.
            </p>
          </div>

          <span className="w-fit rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
            {recentOrders.length} orders
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Total",
                  "Order status",
                  "Payment status",
                  "Date",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="transition-colors hover:bg-orange-50/40"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                    {order.orderNumber || order._id}
                  </td>

                  <td className="px-5 py-4">
                    <span className="block font-medium text-gray-800">
                      {order.user?.name ?? "—"}
                    </span>
                    {order.user?.email && (
                      <span className="mt-1 block text-xs text-gray-500">
                        {order.user.email}
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                    {Number(order.total ?? 0).toFixed(2)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge value={order.orderStatus} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge value={order.paymentStatus} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}

              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <p className="font-medium text-gray-700">
                      No recent orders
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      New orders will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}