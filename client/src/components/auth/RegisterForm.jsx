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
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-600">
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
          className="font-semibold text-[#FF6B4A]"
        >
          Login
        </Link>
      </p>
    </form>
  );
}