import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/vendors", label: "Vendors" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/categories", label: "Categories" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:h-fit lg:w-60">
          <h2 className="mb-5 border-b border-gray-100 pb-4 text-lg font-bold tracking-tight text-gray-900">
            Store Admin
          </h2>

          <nav className="flex flex-wrap gap-2 lg:flex-col">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}