import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

// Route guards
import GuestRoute from "../routes/GuestRoute.jsx";
import ProtectedRoute from "../routes/ProtectedRoute.jsx";

// General pages
import Home from "../pages/Home.jsx";
import NotFound from "../pages/NotFound.jsx";

// Authentication
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";

// User pages
import Account from "../pages/user/Account.jsx";

// Vendor pages
import VendorApply from "../pages/vendor/VendorApply.jsx";
import VendorProfile from "../pages/vendor/VendorProfile.jsx";
import VendorDashboard from "../pages/vendor/VendorDashboard.jsx";
import VendorOrders from "../pages/vendor/VendorOrders.jsx";
import VendorOrderDetails from "../pages/vendor/VendorOrderDetails.jsx";
import VendorAnalytics from "../pages/vendor/VendorAnalytics.jsx";

// Product pages
import ProductListPage from "../pages/products/ProductListPage.jsx";
import ProductDetailPage from "../pages/products/ProductDetailPage.jsx";
import ProductManagementPage from "../pages/products/ProductManagementPage.jsx";
import ProductEditorPage from "../pages/products/ProductEditorPage.jsx";

// Category pages
import CategoryManagementPage from "../pages/categories/CategoryManagementPage.jsx";
import CategoryEditorPage from "../pages/categories/CategoryEditorPage.jsx";

// Cart and order pages
import CartPage from "../pages/cart/CartPage.jsx";
import CheckoutPage from "../pages/order/CheckoutPage.jsx";
import OrdersPage from "../pages/order/OrdersPage.jsx";
import OrderDetailsPage from "../pages/order/OrderDetailsPage.jsx";

// Wishlist
import WishlistPage from "../pages/wishlist/WishlistPage.jsx";

const router = createBrowserRouter([
  // Public layout
  {
    element: <PublicLayout />,
    children: [
      // Guest-only authentication pages
      {
        element: <GuestRoute />,
        children: [
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/register",
            element: <Register />,
          },
          {
            path: "/forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "/reset-password",
            element: <ResetPassword />,
          },
        ],
      },

      // Email verification
      {
        path: "/verify-email",
        element: <VerifyEmail />,
      },

      // Public product browsing
      {
        path: "/products",
        element: <ProductListPage />,
      },
      {
        path: "/products/:slug",
        element: <ProductDetailPage />,
      },
    ],
  },

  // Protected application routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // General
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/account",
            element: <Account />,
          },

          // Cart and wishlist
          {
            path: "/cart",
            element: <CartPage />,
          },
          {
            path: "/wishlist",
            element: <WishlistPage />,
          },
          {
            path: "/checkout",
            element: <CheckoutPage />,
          },

          // Customer orders
          {
            path: "/orders",
            element: <OrdersPage />,
          },
          {
            path: "/orders/:orderId",
            element: <OrderDetailsPage />,
          },

          // Vendor application and profile
          {
            path: "/vendor/apply",
            element: <VendorApply />,
          },
          {
            path: "/vendor/profile",
            element: <VendorProfile />,
          },

          // Vendor dashboard
          {
            path: "/vendor/dashboard",
            element: <VendorDashboard />,
          },

          // Vendor product management
          {
            path: "/vendor/products",
            element: <ProductManagementPage mode="vendor" />,
          },
          {
            path: "/vendor/products/new",
            element: <ProductEditorPage mode="vendor" />,
          },
          {
            path: "/vendor/products/edit/:productId",
            element: <ProductEditorPage mode="vendor" />,
          },

          // Vendor category management
          {
            path: "/vendor/categories",
            element: <CategoryManagementPage />,
          },
          {
            path: "/vendor/categories/new",
            element: <CategoryEditorPage />,
          },
          {
            path: "/vendor/categories/edit/:categoryId",
            element: <CategoryEditorPage />,
          },

          // Vendor order management
          {
            path: "/vendor/orders",
            element: <VendorOrders />,
          },
          {
            path: "/vendor/orders/:orderId",
            element: <VendorOrderDetails />,
          },

          // Vendor analytics
          {
            path: "/vendor/analytics",
            element: <VendorAnalytics />,
          },

          // Admin product management
          {
            path: "/admin/products",
            element: <ProductManagementPage mode="admin" />,
          },
          {
            path: "/admin/products/new",
            element: <ProductEditorPage mode="admin" />,
          },
          {
            path: "/admin/products/edit/:productId",
            element: <ProductEditorPage mode="admin" />,
          },
        ],
      },
    ],
  },

  // Catch-all route
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
