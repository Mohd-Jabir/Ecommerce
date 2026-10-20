
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginSchema } from "../../schemas/auth.schema.js";
import { useAuth } from "../../hooks/useAuth.js";
import { resendVerification } from "../../api/auth.api.js";

import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [serverError, setServerError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    setResendMessage("");
    setShowResend(false);

    try {
      await login(data);

      const from = location.state?.from?.pathname || "/";

      navigate(from, { replace: true });
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        "Invalid email or password.";

      setServerError(message);

      // Backend returns 403 when email is not verified.
      if (
        status === 403 &&
        message.toLowerCase().includes("verify your email")
      ) {
        setShowResend(true);
      }
    }
  };

  const handleResendVerification = async () => {
    setResendMessage("");
    setServerError("");

    const email = getValues("email");

    if (!email) {
      setServerError("Please enter your email address first.");
      return;
    }

    setIsResending(true);

    try {
      const response = await resendVerification({
        email,
      });

      setResendMessage(
        response.message ||
          "Verification email sent successfully.",
      );
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Could not send verification email.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
        >
          {serverError}
        </div>
      )}

      {resendMessage && (
        <div
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
        >
          {resendMessage}
        </div>
      )}

      <Input
        id="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        {...register("password")}
        error={errors.password?.message}
      />

      <div className="text-right">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
      >
        Login
      </Button>

      {showResend && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-semibold text-gray-800">
            Your email is not verified yet.
          </p>

          <p className="mt-1 text-sm leading-5 text-gray-600">
            Check your inbox for the verification link, or
            request a new verification email.
          </p>

          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResending}
            className="mt-3 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending
              ? "Sending..."
              : "Resend verification email"}
          </button>
        </div>
      )}

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
