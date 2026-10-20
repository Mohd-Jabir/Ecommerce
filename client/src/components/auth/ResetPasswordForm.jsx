import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { resetPassword } from "../../api/auth.api.js";
import { resetPasswordSchema } from "../../schemas/auth.schema.js";

import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMessage("");

    if (!token) {
      setServerError("Invalid or missing reset link.");
      return;
    }

    try {
      const response = await resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      setSuccessMessage(response.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Unable to reset password.",
      );
    }
  };

  if (!token) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm leading-6 text-red-700">
        Invalid or missing password reset token.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm leading-6 text-red-700">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-sm leading-6 text-emerald-700">
          {successMessage}
        </div>
      )}

      <Input
        id="password"
        type="password"
        label="New password"
        placeholder="••••••••"
        {...register("password")}
        error={errors.password?.message}
      />

      <Input
        id="confirmPassword"
        type="password"
        label="Confirm new password"
        placeholder="••••••••"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" loading={isSubmitting}>
        Reset password
      </Button>

      <p className="pt-1 text-center text-sm text-gray-500">
        <Link
          to="/login"
          className="font-semibold text-orange-600 transition-colors duration-200 hover:text-orange-700 hover:underline"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}