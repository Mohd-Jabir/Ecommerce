import { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-orange-600"
        : "text-gray-600 hover:text-orange-600"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 text-xl font-bold tracking-tight text-gray-900 transition-colors hover:text-orange-600 sm:text-2xl"
        >
          Ecommerce
          <span className="text-orange-500">.</span>
        </Link>

        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 sm:gap-x-5 lg:gap-x-6">

          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          {/* Customer links */}
          {user && user.role !== "admin" && (
            <>
              <NavLink to="/cart" className={navLinkClass}>
                🛒 Cart
              </NavLink>

              <NavLink to="/wishlist" className={navLinkClass}>
                ♡ Wishlist
              </NavLink>

              <NavLink to="/orders" className={navLinkClass}>
                My Orders
              </NavLink>

              <NavLink to="/account" className={navLinkClass}>
                Account
              </NavLink>
            </>
          )}

          {/* Vendor links */}
          {user?.role === "vendor" && (
            <>
              <NavLink
                to="/vendor/dashboard"
                className={navLinkClass}
              >
                Vendor Dashboard
              </NavLink>

              <NavLink
                to="/vendor/profile"
                className={navLinkClass}
              >
                Store Profile
              </NavLink>
            </>
          )}

          {/* Admin links */}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "border border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                }`
              }
            >
              Admin Dashboard
            </NavLink>
          )}

          {/* Login / Register / Logout */}
          {!user ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              {logoutError && (
                <p
                  role="alert"
                  className="w-full text-right text-sm text-red-600"
                >
                  {logoutError}
                </p>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
