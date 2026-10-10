import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplyToBecomeVendor } from "../../hooks/useVendor.js";

export default function VendorApply() {
  const applyMutation = useApplyToBecomeVendor();

  const [form, setForm] = useState({
    storeName: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const { addressLine1, city, state, pincode, country, ...details } = form;

    const businessAddress = {
      addressLine1,
      city,
      state,
      pincode,
      country,
    };

    applyMutation.mutate({
      ...details,
      businessAddress,
    });
  }

  const errorMessage =
    applyMutation.error?.response?.data?.message ||
    applyMutation.error?.message;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to home
        </Link>

        <h1 className="mt-5 text-2xl font-semibold text-gray-900">
          Become a seller
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Tell us about your store. Your application will be reviewed before
          selling privileges are enabled.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field
            label="Store name"
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Store description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={2000}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-gray-900"
              placeholder="What will your store sell?"
            />
          </div>

          <Field
            label="Contact email"
            name="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={handleChange}
            required
          />

          <Field
            label="Contact phone"
            name="contactPhone"
            type="tel"
            value={form.contactPhone}
            onChange={handleChange}
          />

          <div className="border-t border-gray-200 pt-5">
            <h2 className="font-medium text-gray-900">Business address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Address"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
              />
              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
              />
              <Field
                label="PIN code"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
              />
              <Field
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {applyMutation.isSuccess && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Application submitted. Your status is pending review.
              <Link to="/vendor/profile" className="ml-1 font-medium underline">
                View application
              </Link>
            </p>
          )}

          {applyMutation.isError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage || "Unable to submit your application."}
            </p>
          )}

          <button
            type="submit"
            disabled={applyMutation.isPending}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applyMutation.isPending ? "Submitting..." : "Submit application"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
      />
    </div>
  );
}
