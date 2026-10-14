import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplyToBecomeVendor } from "../../hooks/useVendor.js";

const initialForm = {
  storeName: "",
  description: "",
  contactEmail: "",
  contactPhone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export default function VendorApply() {
  const [form, setForm] = useState(initialForm);
  const applyMutation = useApplyToBecomeVendor();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const { addressLine1, city, state, pincode, country, ...details } = form;

    const businessAddress = Object.fromEntries(
      Object.entries({ addressLine1, city, state, pincode, country }).filter(
        ([, value]) => value.trim() !== "",
      ),
    );

    applyMutation.mutate({
      ...details,
      businessAddress,
    });
  }

  const errorMessage =
    applyMutation.error?.response?.data?.message ||
    applyMutation.error?.message ||
    "Unable to submit your application.";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to home
        </Link>

        <h1 className="mt-5 text-2xl font-semibold">Become a seller</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tell us about your store. Selling features become available after your
          application is approved.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field
            label="Store name"
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={100}
          />

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium"
            >
              Store description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={2000}
              className="w-full rounded-lg border border-gray-300 p-3"
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
            maxLength={254}
          />

          <Field
            label="Contact phone"
            name="contactPhone"
            type="tel"
            value={form.contactPhone}
            onChange={handleChange}
            maxLength={20}
          />

          <h2 className="border-t pt-5 font-medium">Business address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Address"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              maxLength={200}
            />
            <Field
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              maxLength={100}
            />
            <Field
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              maxLength={100}
            />
            <Field
              label="PIN code"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              maxLength={20}
            />
            <Field
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          {applyMutation.isSuccess && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Application submitted. You can check your status in your{" "}
              <Link to="/vendor/profile" className="font-medium underline">
                vendor profile
              </Link>
              .
            </div>
          )}

          {applyMutation.isError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={applyMutation.isPending}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white disabled:opacity-60"
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
  ...props
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
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
      />
    </div>
  );
}
