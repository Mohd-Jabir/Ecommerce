import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getCart } from "../../api/cart.api.js";
import { createOrder } from "../../api/order.api.js";
import { useMyAddresses } from "../../hooks/useUser.js";
import RazorpayPaymentButton from "../../components/payments/RazorpayPaymentButton.jsx";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-page px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

// Maps common saved-address field names to the checkout format.
const normalizeAddress = (saved = {}) => ({
  fullName: String(saved.fullName ?? saved.name ?? ""),
  phone: String(saved.phone ?? saved.phoneNumber ?? ""),
  addressLine1: String(
    saved.addressLine1 ?? saved.address ?? saved.street ?? "",
  ),
  addressLine2: String(saved.addressLine2 ?? ""),
  city: String(saved.city ?? saved.town ?? ""),
  state: String(saved.state ?? saved.stateName ?? ""),
  postalCode: String(
    saved.postalCode ?? saved.pinCode ?? saved.pincode ?? saved.zipCode ?? "",
  ),
  country: String(saved.country || "India"),
});

const requiredFields = [
  ["fullName", "full name"],
  ["phone", "phone number"],
  ["addressLine1", "address line 1"],
  ["city", "city"],
  ["state", "state"],
  ["postalCode", "PIN code"],
  ["country", "country"],
];

const getAddressId = (address) => address?._id ?? address?.id ?? "";

const isDefaultAddress = (address) =>
  Boolean(address?.isDefault || address?.isDefaultAddress);

const formatAddress = (address) => {
  const a = normalizeAddress(address);

  return [
    a.addressLine1,
    a.addressLine2,
    a.city,
    a.state,
    a.postalCode,
    a.country,
  ]
    .filter((part) => String(part || "").trim())
    .join(", ");
};

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [] });
  const [address, setAddress] = useState({ ...emptyAddress });
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  const {
    data: savedAddressData,
    isLoading: loadingAddresses,
    isError: addressesError,
  } = useMyAddresses();

  // Support hooks that return either an array or an object containing it.
  const savedAddresses = useMemo(() => {
    if (Array.isArray(savedAddressData)) {
      return savedAddressData;
    }

    if (Array.isArray(savedAddressData?.data)) {
      return savedAddressData.data;
    }

    if (Array.isArray(savedAddressData?.addresses)) {
      return savedAddressData.addresses;
    }

    if (Array.isArray(savedAddressData?.data?.addresses)) {
      return savedAddressData.data.addresses;
    }

    return [];
  }, [savedAddressData]);

  useEffect(() => {
    let active = true;

    async function loadCart() {
      try {
        const result = await getCart();

        if (active) {
          // Support either a direct cart or a wrapped API response.
          const cartData =
            result?.data?.cart ?? result?.data ?? result?.cart ?? result;

          setCart(cartData || { items: [] });
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || "Unable to load your cart.");
        }
      } finally {
        if (active) {
          setLoadingCart(false);
        }
      }
    }

    loadCart();

    return () => {
      active = false;
    };
  }, []);

  // Select the default address, or the first saved address.
  useEffect(() => {
    if (loadingAddresses || useNewAddress || createdOrder) {
      return;
    }

    if (savedAddresses.length === 0) {
      setSelectedAddressId("");
      setAddress({ ...emptyAddress });
      setUseNewAddress(true);
      return;
    }

    const currentAddressExists = savedAddresses.some(
      (item) => String(getAddressId(item)) === String(selectedAddressId),
    );

    if (!currentAddressExists) {
      const selected =
        savedAddresses.find(isDefaultAddress) ?? savedAddresses[0];

      setSelectedAddressId(String(getAddressId(selected)));
      setAddress(normalizeAddress(selected));
    }
  }, [
    savedAddresses,
    loadingAddresses,
    selectedAddressId,
    useNewAddress,
    createdOrder,
  ]);

  const items = Array.isArray(cart?.items) ? cart.items : [];

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.product?.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return sum + price * quantity;
  }, 0);

  const updateField = (event) => {
    const { name, value } = event.target;

    setAddress((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const selectSavedAddress = (savedAddress) => {
    setSelectedAddressId(String(getAddressId(savedAddress)));
    setAddress(normalizeAddress(savedAddress));
    setUseNewAddress(false);
    setError("");
  };

  const startNewAddress = () => {
    setSelectedAddressId("");
    setAddress({ ...emptyAddress });
    setUseNewAddress(true);
    setError("");
  };

  const chooseSavedAddress = () => {
    if (!savedAddresses.length) {
      startNewAddress();
      return;
    }

    const selected = savedAddresses.find(isDefaultAddress) ?? savedAddresses[0];

    selectSavedAddress(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (createdOrder) return;

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    const missing = requiredFields.find(
      ([field]) => !String(address[field] ?? "").trim(),
    );

    if (missing) {
      setError(`Please provide your ${missing[1]}.`);
      return;
    }

    const phoneDigits = address.phone.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError("Please enter a valid phone number.");
      return;
    }

    const pin = address.postalCode.trim();

    if (!/^\d{6}$/.test(pin) && address.country === "India") {
      setError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setSubmitting(true);

    try {
      // The backend must calculate prices and validate stock.
      const result = await createOrder({
        ...address,
        phone: address.phone.trim(),
        postalCode: address.postalCode.trim(),
      });

      // Handle common API response shapes:
      // { _id }, { order: { _id } },
      // { data: { _id } }, { data: { order: { _id } } }
      const order =
        result?.data?.order ?? result?.order ?? result?.data ?? result;

      const localOrderId = order?._id ?? order?.id;

      if (!localOrderId) {
        throw new Error(
          "The order response did not include an order ID. Check createOrder in your order API.",
        );
      }

      setCreatedOrder({
        ...order,
        _id: localOrderId,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart || loadingAddresses) {
    return (
      <main className="min-h-screen bg-page px-4 pt-32 text-foreground">
        Loading checkout...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page px-4 pb-20 pt-28 text-foreground sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <Link to="/cart" className="text-sm text-muted hover:text-foreground">
          ← Back to cart
        </Link>

        <header className="mb-9 mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Almost yours
          </p>

          <h1 className="mt-3 text-4xl font-semibold">Checkout</h1>

          <p className="mt-3 text-sm text-muted">
            Choose a saved delivery address or add a new one.
          </p>
        </header>

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-xl bg-red-500/5 p-4 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {addressesError && (
          <p className="mb-6 rounded-xl border border-border p-4 text-sm text-muted">
            We couldn't load your saved addresses. You can enter a new address
            below.
          </p>
        )}

        {!items.length ? (
          <div className="rounded-2xl border border-border p-8">
            Your cart is empty.{" "}
            <Link className="underline" to="/products">
              Browse products
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid items-start gap-8 lg:grid-cols-[1fr_340px]"
          >
            <section className="rounded-3xl border border-border bg-card/30 p-5 sm:p-8">
              <h2 className="text-xl font-semibold">Delivery address</h2>

              {savedAddresses.length > 0 && !useNewAddress && (
                <div className="mt-6 space-y-3">
                  {savedAddresses.map((savedAddress, index) => {
                    const id = String(getAddressId(savedAddress));
                    const selected = id === String(selectedAddressId);
                    const normalized = normalizeAddress(savedAddress);

                    return (
                      <label
                        key={id || index}
                        className={`block cursor-pointer rounded-2xl border p-4 transition ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={selected}
                            onChange={() => selectSavedAddress(savedAddress)}
                            className="mt-1 accent-current"
                            disabled={Boolean(createdOrder)}
                          />

                          <div className="min-w-0 flex-1 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold">
                                {normalized.fullName || "Name missing"}
                              </span>

                              {isDefaultAddress(savedAddress) && (
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-muted">
                              {normalized.phone || "Phone number missing"}
                            </p>

                            <p className="mt-2 leading-6 text-muted">
                              {formatAddress(savedAddress) ||
                                "Address details missing"}
                            </p>

                            {requiredFields.some(
                              ([field]) =>
                                !String(normalized[field] ?? "").trim(),
                            ) && (
                              <p className="mt-2 text-xs text-red-600">
                                This saved address is incomplete. Choose another
                                address or add a new one.
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {savedAddresses.length > 0 && !createdOrder && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {!useNewAddress ? (
                    <button
                      type="button"
                      onClick={startNewAddress}
                      className="rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:border-primary"
                    >
                      + Add a new address
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={chooseSavedAddress}
                      className="rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:border-primary"
                    >
                      ← Choose a saved address
                    </button>
                  )}
                </div>
              )}

              {useNewAddress && (
                <div className="mt-6">
                  <h3 className="font-medium">
                    {savedAddresses.length
                      ? "New delivery address"
                      : "Enter your delivery address"}
                  </h3>

                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    {[
                      ["fullName", "Full name", true],
                      ["phone", "Phone number", true],
                      ["addressLine1", "Address line 1", true],
                      ["addressLine2", "Address line 2", false],
                      ["city", "City", true],
                      ["state", "State", true],
                      ["postalCode", "PIN code", true],
                      ["country", "Country", true],
                    ].map(([name, label, required]) => (
                      <label
                        key={name}
                        className={
                          name.startsWith("addressLine")
                            ? "text-sm text-muted sm:col-span-2"
                            : "text-sm text-muted"
                        }
                      >
                        {label}

                        <input
                          className={inputClass}
                          name={name}
                          value={address[name]}
                          onChange={updateField}
                          required={required}
                          disabled={Boolean(createdOrder)}
                          autoComplete={
                            name === "fullName"
                              ? "name"
                              : name === "phone"
                                ? "tel"
                                : name === "addressLine1"
                                  ? "street-address"
                                  : name === "city"
                                    ? "address-level2"
                                    : name === "state"
                                      ? "address-level1"
                                      : name === "postalCode"
                                        ? "postal-code"
                                        : name === "country"
                                          ? "country-name"
                                          : "address-line2"
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 rounded-2xl border border-border p-4">
                <p className="font-medium">Payment method</p>

                <p className="mt-1 text-sm text-muted">
                  Secure online payment with Razorpay
                </p>

                {!createdOrder ? (
                  <p className="mt-2 text-xs text-muted">
                    Continue to create your order before opening Razorpay
                    Checkout.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-muted">
                      Order created. Complete payment to finish checkout.
                    </p>

                    <RazorpayPaymentButton
                      orderId={createdOrder._id}
                      customerName={address.fullName}
                      customerEmail=""
                      customerPhone={address.phone}
                    />
                  </div>
                )}
              </div>

              {!createdOrder && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 sm:w-auto"
                >
                  {submitting ? "Creating order..." : "Continue to payment"}
                </button>
              )}
            </section>

            <aside className="rounded-3xl border border-border bg-card/50 p-6">
              <h2 className="text-lg font-semibold">Your order</h2>

              <div className="mt-5 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.product?._id || index}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-muted">
                      {item.product?.name || "Product"} × {item.quantity}
                    </span>

                    <span className="shrink-0">
                      {money(
                        (Number(item.product?.price) || 0) *
                          (Number(item.quantity) || 0),
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <div className="flex justify-between gap-4 font-semibold">
                  <span>Estimated total</span>
                  <span>{money(subtotal)}</span>
                </div>

                <p className="mt-3 text-xs leading-5 text-muted">
                  The backend must recalculate the final total using current
                  product prices, shipping charges, discounts, and stock.
                </p>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
