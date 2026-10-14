
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useMyVendorProfile,
  useUpdateVendorProfile,
} from "../../hooks/useVendor.js";
import ImageKitImageUpload from "../../components/common/ImageKitImageUpload.jsx";

export default function VendorProfile() {
  const vendorQuery = useMyVendorProfile();
  const updateMutation = useUpdateVendorProfile();
  const vendor = vendorQuery.data;

  const [form, setForm] = useState({
    storeName: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    logo: "",
  });

  useEffect(() => {
    if (!vendor) return;

    setForm({
      storeName: vendor.storeName ?? "",
      description: vendor.description ?? "",
      contactEmail: vendor.contactEmail ?? "",
      contactPhone: vendor.contactPhone ?? "",
      logo: vendor.logo ?? "",
    });
  }, [vendor]);

  if (vendorQuery.isLoading) {
    return <main className="p-8">Loading vendor profile...</main>;
  }

  if (vendorQuery.isError) {
    const notFound = vendorQuery.error?.response?.status === 404;

    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">
          {notFound ? "No vendor application found" : "Unable to load profile"}
        </h1>
        <p className="mt-2 text-gray-600">
          {notFound
            ? "Apply to become a seller before accessing your vendor profile."
            : vendorQuery.error?.response?.data?.message ||
              "Please try again."}
        </p>
        {notFound ? (
          <Link to="/vendor/apply" className="mt-5 inline-block underline">
            Apply now
          </Link>
        ) : (
          <button onClick={() => vendorQuery.refetch()} className="mt-4 underline">
            Try again
          </button>
        )}
      </main>
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = Object.fromEntries(
      Object.entries(form).filter(([key, value]) =>
        key === "logo" ? value.trim() !== "" : true
      )
    );

    updateMutation.mutate(payload);
  }

  const statusStyles = {
    pending: "bg-amber-50 text-amber-800",
    approved: "bg-green-50 text-green-800",
    rejected: "bg-red-50 text-red-800",
    suspended: "bg-gray-100 text-gray-700",
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="text-sm text-gray-500">← Home</Link>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Vendor profile</h1>
          <span className={`rounded-full px-3 py-1 text-sm ${
            statusStyles[vendor.status] || statusStyles.pending
          }`}>
            {vendor.status}
          </span>
        </div>

        {vendor.status !== "approved" ? (
          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <p className="font-medium">
              {vendor.status === "pending" && "Application awaiting review"}
              {vendor.status === "rejected" && "Application rejected"}
              {vendor.status === "suspended" && "Account suspended"}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {vendor.rejectionReason ||
                "You can view your store information here. Editing is available after approval."}
            </p>
            {vendor.status === "rejected" && (
              <Link to="/vendor/apply" className="mt-3 inline-block underline">
                Submit a new application
              </Link>
            )}
            <p className="mt-3 text-sm text-gray-500">
              Store: {vendor.storeName}
            </p>
            <p className="text-sm text-gray-500">
              Contact: {vendor.contactEmail}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <Field label="Store name" name="storeName" value={form.storeName}
              onChange={handleChange} required maxLength={100} />
            <Field label="Description" name="description" value={form.description}
              onChange={handleChange} multiline />
            <Field label="Contact email" name="contactEmail" type="email"
              value={form.contactEmail} onChange={handleChange} required />
            <Field label="Contact phone" name="contactPhone"
              value={form.contactPhone} onChange={handleChange} />

            <ImageKitImageUpload
              label="Store logo"
              folder="/ecommerce/store-logos"
              value={form.logo}
              onChange={(url) =>
                setForm((current) => ({ ...current, logo: url || "" }))
              }
            />

            {updateMutation.isSuccess && (
              <p className="text-sm text-green-700">
                Profile updated successfully.
              </p>
            )}

            {updateMutation.isError && (
              <p role="alert" className="text-sm text-red-700">
                {updateMutation.error?.response?.data?.message ||
                  "Unable to update profile."}
              </p>
            )}

            <button disabled={updateMutation.isPending}
              className="rounded-lg bg-gray-900 px-5 py-3 text-white disabled:opacity-60">
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
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
  multiline = false,
}) {
  const classes =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900";

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {multiline ? (
        <textarea id={name} name={name} value={value} onChange={onChange}
          rows={4} maxLength={2000} className={classes} />
      ) : (
        <input id={name} name={name} type={type} value={value}
          onChange={onChange} required={required} className={classes} />
      )}
    </div>
  );
}
