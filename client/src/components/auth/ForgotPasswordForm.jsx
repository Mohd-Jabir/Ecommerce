import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../api/auth.api.js";
import { forgotPasswordSchema } from "../../schemas/auth.schema.js";

import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const response = await forgotPassword(data);

      setSuccessMessage(response.message);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Unable to process request.",
      );
    }
  };

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
        id="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <Button type="submit" loading={isSubmitting}>
        Send reset link
      </Button>

      <p className="pt-1 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-orange-600 transition-colors duration-200 hover:text-orange-700 hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}