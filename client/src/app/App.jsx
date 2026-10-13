import { createBrowserRouter, RouterProvider } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

import GuestRoute from "../routes/GuestRoute.jsx";
import ProtectedRoute from "../routes/ProtectedRoute.jsx";

import Home from "../pages/Home.jsx";
import NotFound from "../pages/NotFound.jsx";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";

import Account from "../pages/user/Account.jsx";

import VendorApply from "../pages/vendor/VendorApply.jsx";
import VendorProfile from "../pages/vendor/VendorProfile.jsx";
import VendorDashboard from "../pages/vendor/VendorDashboard.jsx";

import ProductListPage from "../pages/products/ProductListPage.jsx";
import ProductDetailPage from "../pages/products/ProductDetailPage.jsx";
import ProductManagementPage from "../pages/products/ProductManagementPage.jsx";
import ProductEditorPage from "../pages/products/ProductEditorPage.jsx";

import CategoryManagementPage from "../pages/categories/CategoryManagementPage.jsx";
import CategoryEditorPage from "../pages/categories/CategoryEditorPage.jsx";
import CartPage from "../pages/cart/CartPage.jsx";
import CheckoutPage from "../pages/order/CheckoutPage.jsx";
import OrdersPage from "../pages/order/OrdersPage.jsx";
import OrderDetailsPage from "../pages/order/OrderDetailsPage.jsx";
const router = createBrowserRouter([
  // Public layout
  {
    element: <PublicLayout />,
    children: [
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
      {
        path: "/verify-email",
        element: <VerifyEmail />,
      },
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
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/account",
            element: <Account />,
          },
          {
            path: "/cart",
            element: <CartPage />,
          },
          {
            path: "/checkout",
            element: <CheckoutPage />,
          },
          {
            path: "/orders",
            element: <OrdersPage />,
          },
          {
            path: "/orders/:orderId",
            element: <OrderDetailsPage />,
          },

          {
            path: "/vendor/apply",
            element: <VendorApply />,
          },
          {
            path: "/vendor/profile",
            element: <VendorProfile />,
          },
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
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
