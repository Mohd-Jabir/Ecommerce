import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useMyVendorProfile,
  useUpdateVendorProfile,
} from "../../hooks/useVendor.js";

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
    if (vendor) {
      setForm({
        storeName: vendor.storeName ?? "",
        description: vendor.description ?? "",
        contactEmail: vendor.contactEmail ?? "",
        contactPhone: vendor.contactPhone ?? "",
        logo: vendor.logo ?? "",
      });
    }
  }, [vendor]);

  if (vendorQuery.isLoading) {
    return <main className="p-8">Loading vendor profile...</main>;
  }

  if (vendorQuery.isError && vendorQuery.error?.response?.status === 404) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">No vendor application</h1>
        <p className="mt-2 text-gray-600">
          Apply to create your store before accessing vendor features.
        </p>
        <Link
          to="/vendor/apply"
          className="mt-5 inline-block rounded-lg bg-gray-900 px-4 py-2 text-white"
        >
          Apply now
        </Link>
      </main>
    );
  }

  if (vendorQuery.isError) {
    return (
      <main className="p-8">
        Unable to load your vendor profile.
        <button
          onClick={() => vendorQuery.refetch()}
          className="ml-2 underline"
        >
          Try again
        </button>
      </main>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    updateMutation.mutate(form);
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
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Home
        </Link>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Vendor profile</h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles[vendor.status] ?? statusStyles.pending}`}
          >
            {vendor.status}
          </span>
        </div>

        {vendor.status === "pending" && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Your application is awaiting admin review.
          </p>
        )}

        {vendor.status === "rejected" && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            Application rejected:{" "}
            {vendor.rejectionReason ||
              "Please contact support for more information."}
          </p>
        )}

        {vendor.status === "suspended" && (
          <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
            Your vendor account is suspended. Contact support for assistance.
          </p>
        )}

        {vendor.status === "approved" ? (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {[
              ["storeName", "Store name"],
              ["description", "Description"],
              ["contactEmail", "Contact email"],
              ["contactPhone", "Contact phone"],
              ["logo", "Logo URL"],
            ].map(([name, label]) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="mb-1 block text-sm font-medium"
                >
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={
                    name === "contactEmail"
                      ? "email"
                      : name === "logo"
                        ? "url"
                        : "text"
                  }
                  value={form[name]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
                  }
                  required={["storeName", "contactEmail"].includes(name)}
                  maxLength={name === "description" ? 2000 : 2048}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-900"
                />
              </div>
            ))}

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

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white disabled:opacity-60"
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p>
              <strong>Store:</strong> {vendor.storeName}
            </p>
            <p>
              <strong>Contact:</strong> {vendor.contactEmail}
            </p>
            <p>
              <strong>Application submitted:</strong>{" "}
              {new Date(vendor.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
