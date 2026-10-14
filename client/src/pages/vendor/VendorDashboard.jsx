
import { Link } from "react-router-dom";
import { useVendorDashboard } from "../../hooks/useVendor.js";

export default function VendorDashboard() {
  const { data, isLoading, isError, error, refetch } = useVendorDashboard();

  if (isLoading) {
    return <main className="p-8">Loading your dashboard...</main>;
  }

  if (isError) {
    return (
      <main className="p-8">
        <p role="alert" className="text-red-600">
          {error?.response?.data?.message || "Unable to load dashboard."}
        </p>
        <button onClick={() => refetch()} className="mt-3 underline">
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
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-gray-200 text-gray-700",
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Vendor dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome to {vendor.storeName}.
            </p>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${
            statusStyle[vendor.status] || statusStyle.pending
          }`}>
            {vendor.status}
          </span>
        </header>

        {vendor.status !== "approved" ? (
          <section className="mt-8 rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">
              {vendor.status === "pending" && "Your application is under review"}
              {vendor.status === "rejected" && "Your application was rejected"}
              {vendor.status === "suspended" && "Your vendor account is suspended"}
            </h2>
            <p className="mt-2 text-gray-600">
              {vendor.status === "pending"
                ? "You can review your store information while waiting for approval."
                : vendor.status === "rejected"
                  ? vendor.rejectionReason || "Please contact support for details."
                  : "Contact support for assistance with your account."}
            </p>
            <Link to="/vendor/profile" className="mt-4 inline-block underline">
              View store profile
            </Link>
            {vendor.status === "rejected" && (
              <Link to="/vendor/apply" className="ml-5 inline-block underline">
                Apply again
              </Link>
            )}
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold">
                    {Number(value).toLocaleString()}
                  </p>
                </div>
              ))}
            </section>

            <section className="mt-8 rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold">Manage your store</h2>
              <div className="mt-4 flex flex-wrap gap-3">
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
    <Link to={to} className="rounded-lg border px-4 py-3 transition hover:bg-gray-50">
      {children}
    </Link>
  );
}
