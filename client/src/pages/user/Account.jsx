import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  useMyProfile,
  useUpdateMyProfile,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../../hooks/useUser.js";
import { useMyVendorProfile } from "../../hooks/useVendor.js";

const emptyAddress = {
  name: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100";

const buttonClass =
  "inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50";

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

export default function Account() {
  const { logout } = useAuth();

  const { data: user, isPending, isError, error } = useMyProfile();

  const updateProfile = useUpdateMyProfile();
  const createAddress = useAddAddress();
  const editAddress = useUpdateAddress();
  const removeAddress = useDeleteAddress();
  const makeDefault = useSetDefaultAddress();

  // Vendor application/profile status
  const vendorQuery = useMyVendorProfile();
  const vendor = vendorQuery.data;
  const vendorStatus = vendor?.status;

  const [profileForm, setProfileForm] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingId, setEditingId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  const addresses = user?.addresses || [];

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      name: current?.name ?? user.name ?? "",
      phone: current?.phone ?? user.phone ?? "",
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setFormError("");

    const values = profileForm || {
      name: user.name || "",
      phone: user.phone || "",
    };

    const payload = {};

    if (values.name.trim() && values.name.trim() !== user.name) {
      payload.name = values.name.trim();
    }

    if ((values.phone || "") !== (user.phone || "")) {
      payload.phone = values.phone.trim();
    }

    if (!Object.keys(payload).length) {
      setFormError("Make a change before saving.");
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        setProfileForm(null);
        setMessage("Profile updated successfully.");
      },
      onError: (err) => setFormError(getErrorMessage(err)),
    });
  };

  const openAddAddress = () => {
    setEditingId(null);
    setAddressForm({
      ...emptyAddress,
      isDefault: addresses.length === 0,
    });
    setShowAddressForm(true);
    setMessage("");
    setFormError("");
  };

  const openEditAddress = (address) => {
    setEditingId(address._id);
    setAddressForm({
      name: address.name || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
    setMessage("");
    setFormError("");
  };

  const handleAddressChange = (event) => {
    const { name, value, checked, type } = event.target;

    setAddressForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSubmit = (event) => {
    event.preventDefault();
    setMessage("");
    setFormError("");

    const payload = {
      name: addressForm.name.trim(),
      phone: addressForm.phone.trim(),
      addressLine1: addressForm.addressLine1.trim(),
      addressLine2: addressForm.addressLine2.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
      country: addressForm.country.trim(),
    };

    const mutation = editingId ? editAddress : createAddress;

    const variables = editingId
      ? { addressId: editingId, payload }
      : { ...payload, isDefault: addressForm.isDefault };

    mutation.mutate(variables, {
      onSuccess: () => {
        setShowAddressForm(false);
        setEditingId(null);
        setAddressForm(emptyAddress);
        setMessage(
          editingId
            ? "Address updated successfully."
            : "Address added successfully.",
        );
      },
      onError: (err) => setFormError(getErrorMessage(err)),
    });
  };

  const handleDeleteAddress = (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setMessage("");
    setFormError("");

    removeAddress.mutate(addressId, {
      onSuccess: () => setMessage("Address deleted successfully."),
      onError: (err) => setFormError(getErrorMessage(err)),
    });
  };

  const handleSetDefault = (addressId) => {
    setMessage("");
    setFormError("");

    makeDefault.mutate(addressId, {
      onSuccess: () => setMessage("Default address updated successfully."),
      onError: (err) => setFormError(getErrorMessage(err)),
    });
  };

  if (isPending) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] px-6 py-12">
        <div className="mx-auto max-w-5xl animate-pulse space-y-5">
          <div className="h-9 w-56 rounded-lg bg-gray-200" />
          <div className="h-64 rounded-2xl bg-white shadow-sm" />
          <div className="h-72 rounded-2xl bg-white shadow-sm" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-6">
        <div
          role="alert"
          className="mx-auto max-w-5xl rounded-xl bg-red-50 p-4 text-red-700"
        >
          {getErrorMessage(error)}
        </div>
      </main>
    );
  }

  const profileValues = profileForm || {
    name: user.name || "",
    phone: user.phone || "",
  };

  const addressMutationPending =
    createAddress.isPending || editAddress.isPending;

  const vendorQueryFailed =
    vendorQuery.isError && vendorQuery.error?.response?.status !== 404;

  const vendorHasNoApplication = vendorQuery.error?.response?.status === 404;

  const vendorAction = () => {
    if (vendorStatus === "approved") {
      return {
        label: "Open seller dashboard",
        to: "/vendor/dashboard",
      };
    }

    if (
      vendorStatus === "pending" ||
      vendorStatus === "rejected" ||
      vendorStatus === "suspended"
    ) {
      return {
        label: "View application status",
        to: "/vendor/profile",
      };
    }

    return {
      label: "Apply to become a seller",
      to: "/vendor/apply",
    };
  };

  const sellerHeading =
    vendorStatus === "approved"
      ? "Your seller account"
      : "Want to sell with us?";

  const sellerDescription = {
    approved:
      "Manage your store, products, and orders from your seller dashboard.",
    pending:
      "Your application is awaiting review. Check its current status here.",
    rejected:
      "Your previous application was rejected. Review the status and next steps.",
    suspended:
      "Your seller account is suspended. Contact support for assistance.",
  };

  const sellerAction = vendorAction();

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            My account
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Account settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information and delivery addresses.
          </p>
        </header>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        {/* Personal information */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">
            Personal information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update the name and phone number associated with your account.
          </p>

          <form
            onSubmit={handleProfileSubmit}
            className="mt-6 grid gap-5 sm:grid-cols-2"
          >
            <label className="block text-sm font-medium text-gray-700">
              Full name
              <input
                className={inputClass}
                name="name"
                value={profileValues.name}
                onChange={handleProfileChange}
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Phone number
              <input
                className={inputClass}
                name="phone"
                type="tel"
                value={profileValues.phone}
                onChange={handleProfileChange}
                maxLength={20}
              />
            </label>

            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              Email address
              <input
                className={`${inputClass} bg-gray-50 text-gray-500`}
                value={user.email || ""}
                readOnly
              />
              <span className="mt-1 block text-xs text-gray-500">
                Email cannot be changed here.
              </span>
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className={buttonClass}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Delivery addresses */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Delivery addresses
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage where your orders should be delivered.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddAddress}
              className={buttonClass}
            >
              + Add address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
              <h3 className="font-semibold text-gray-900">
                No saved addresses yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add an address to make checkout faster.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <article
                  key={address._id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {address.name}
                    </h3>

                    {address.isDefault && (
                      <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                    <br />
                    {address.city}, {address.state} {address.pincode}
                    <br />
                    {address.country}
                    <br />
                    {address.phone}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditAddress(address)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address._id)}
                        disabled={makeDefault.isPending}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Set default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(address._id)}
                      disabled={removeAddress.isPending}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {removeAddress.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Add/edit address form */}
        {showAddressForm && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit address" : "Add a delivery address"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the address details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleAddressSubmit}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              {[
                ["name", "Full name", true],
                ["phone", "Phone number", true],
                ["addressLine1", "Address line 1", true],
                ["addressLine2", "Address line 2", false],
                ["city", "City", true],
                ["state", "State", true],
                ["pincode", "PIN code", true],
                ["country", "Country", true],
              ].map(([name, label, required]) => (
                <label
                  key={name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}
                  <input
                    className={inputClass}
                    name={name}
                    value={addressForm[name]}
                    onChange={handleAddressChange}
                    required={required}
                    maxLength={
                      name === "addressLine1" || name === "addressLine2"
                        ? 200
                        : 100
                    }
                  />
                </label>
              ))}

              {!editingId && (
                <label className="flex items-center gap-3 text-sm text-gray-700 sm:col-span-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Set as my default address
                </label>
              )}

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  className={buttonClass}
                  disabled={addressMutationPending}
                >
                  {addressMutationPending
                    ? "Saving..."
                    : editingId
                      ? "Save address"
                      : "Add address"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Seller application / status */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {sellerHeading}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {sellerDescription[vendorStatus] ||
                  "Create your own store and start selling on our marketplace."}
              </p>

              {vendorQuery.isPending ? (
                <div
                  className="mt-5 h-10 w-44 animate-pulse rounded-xl bg-gray-100"
                  aria-label="Loading seller account"
                />
              ) : vendorQueryFailed ? (
                <div className="mt-5">
                  <p role="alert" className="text-sm text-red-600">
                    {getErrorMessage(vendorQuery.error)}
                  </p>
                  <button
                    type="button"
                    onClick={() => vendorQuery.refetch()}
                    className="mt-3 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {vendorStatus && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        vendorStatus === "approved"
                          ? "bg-green-50 text-green-700"
                          : vendorStatus === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : vendorStatus === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {vendorStatus.charAt(0).toUpperCase() +
                        vendorStatus.slice(1)}
                    </span>
                  )}

                  <Link to={sellerAction.to} className={buttonClass}>
                    {sellerAction.label}
                  </Link>

                  {vendorStatus === "rejected" && (
                    <Link
                      to="/vendor/apply"
                      className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Apply again
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sign out */}
        <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-gray-900">Sign out</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign out of your account on this device.
          </p>

          <button
            type="button"
            onClick={logout}
            className="mt-4 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </section>
      </div>
    </main>
  );
}
