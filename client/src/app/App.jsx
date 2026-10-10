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
const router = createBrowserRouter([
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
    ],
  },

  {
  element: <ProtectedRoute />,
  children: [
    {
      element: <AppLayout />,
      children: [
        {
          path:"/",
          element:<Home/>
        },
        {
          path: "/account",
          element: <Account />,
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
