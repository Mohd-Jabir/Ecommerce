
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { registerSchema } from "../../schemas/auth.schema.js";
import { register as registerApi } from "../../api/auth.api.js";

import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMessage("");

    try {
      await registerApi(data);

      setSuccessMessage(
        "Account created successfully. Please verify your email.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Unable to create account.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
          {successMessage}
        </div>
      )}

      <Input
        id="name"
        label="Full name"
        placeholder="John Doe"
        {...register("name")}
        error={errors.name?.message}
      />

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

      <Input
        id="confirmPassword"
        type="password"
        label="Confirm password"
        placeholder="••••••••"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" loading={isSubmitting}>
        Create account
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
