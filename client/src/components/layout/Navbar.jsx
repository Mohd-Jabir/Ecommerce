
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
    `text-sm font-medium transition ${
      isActive
        ? "text-black"
        : "text-gray-600 hover:text-black"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 text-xl font-bold tracking-tight text-gray-900"
        >
          Ecommerce
        </Link>

        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-5">
          <NavLink
            to="/"
            end
            className={navLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={navLinkClass}
          >
            Products
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className={navLinkClass}
          >
            🛒 Cart
          </NavLink>

          {/* Order history */}
          <NavLink
            to="/orders"
            className={navLinkClass}
          >
            My Orders
          </NavLink>

          <NavLink
            to="/account"
            className={navLinkClass}
          >
            Account
          </NavLink>

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

          {/* Logout error */}
          {logoutError && (
            <p
              role="alert"
              className="w-full text-right text-sm text-red-600"
            >
              {logoutError}
            </p>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>
    </header>
  );
}