import { Link } from "react-router-dom";
import { useVendorDashboard } from "../../hooks/useVendor.js";

export default function VendorDashboard() {
  const { data, isLoading, isError, error, refetch } = useVendorDashboard();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-sm text-gray-500">
        Loading your dashboard...
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p role="alert" className="text-sm text-red-600">
          {error?.response?.data?.message || "Unable to load dashboard."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm font-semibold text-orange-600 underline underline-offset-4 transition-colors hover:text-orange-700"
        >
          Try again
        </button>
      </main>
    );
  }

  const { vendor, stats = {} } = data;

  const cards = [
    ["Total products", stats.totalProducts ?? 0],
    ["Active products", stats.activeProducts ?? 0],
    ["Draft products", stats.draftProducts ?? 0],
    ["Low-stock products", stats.lowStockProducts ?? 0],
    ["Active categories", stats.totalCategories ?? 0],
    ["Orders", stats.totalOrders ?? 0],
    ["Pending orders", stats.pendingOrders ?? 0],
    ["Completed orders", stats.completedOrders ?? 0],
  ];

  const statusStyle = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    rejected: "bg-red-50 text-red-700 ring-1 ring-red-200",
    suspended: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
              Seller workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Vendor dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to {vendor.storeName}.
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              statusStyle[vendor.status] || statusStyle.pending
            }`}
          >
            {vendor.status}
          </span>
        </header>

        {vendor.status !== "approved" ? (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">
              {vendor.status === "pending" &&
                "Your application is under review"}
              {vendor.status === "rejected" && "Your application was rejected"}
              {vendor.status === "suspended" &&
                "Your vendor account is suspended"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {vendor.status === "pending"
                ? "You can review your store information while waiting for approval."
                : vendor.status === "rejected"
                  ? vendor.rejectionReason ||
                    "Please contact support for details."
                  : "Contact support for assistance with your account."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Link
                to="/vendor/profile"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                View store profile
              </Link>
              {vendor.status === "rejected" && (
                <Link
                  to="/vendor/apply"
                  className="text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                >
                  Apply again
                </Link>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
                >
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                    {Number(value).toLocaleString()}
                  </p>
                  <div className="mt-4 h-1 w-10 rounded-full bg-orange-400" />
                </div>
              ))}
            </section>

            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Manage your store
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Access your products, orders, categories, and store settings.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <NavLink to="/vendor/products">Manage products</NavLink>
                <NavLink to="/vendor/products/new">Add product</NavLink>
                <NavLink to="/vendor/orders">View orders</NavLink>
                <NavLink to="/vendor/analytics">Sales analytics</NavLink>
                <NavLink to="/vendor/categories">Manage categories</NavLink>
                <NavLink to="/vendor/profile">Store profile</NavLink>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
    >
      {children}
    </Link>
  );
}
