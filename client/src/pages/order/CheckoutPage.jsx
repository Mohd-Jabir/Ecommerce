import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart } from "../../api/cart.api.js";
import { createOrder } from "../../api/order.api.js";
import { useMyAddresses } from "../../hooks/useUser.js";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-page px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

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

const normalizeAddress = (address) => ({
  fullName: address?.fullName || "",
  phone: address?.phone || "",
  addressLine1: address?.addressLine1 || "",
  addressLine2: address?.addressLine2 || "",
  city: address?.city || "",
  state: address?.state || "",
  postalCode: address?.postalCode || "",
  country: address?.country || "India",
});

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [] });
  const [address, setAddress] = useState(emptyAddress);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    data: savedAddresses = [],
    isLoading: loadingAddresses,
    isError: addressesError,
  } = useMyAddresses();

  // Load the cart.
  useEffect(() => {
    getCart()
      .then((data) => setCart(data || { items: [] }))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load your cart."),
      )
      .finally(() => setLoadingCart(false));
  }, []);

  // Select the default saved address, or the first one.
  useEffect(() => {
    if (loadingAddresses || useNewAddress) return;

    if (!savedAddresses.length) {
      setSelectedAddressId("");
      setAddress(emptyAddress);
      setUseNewAddress(true);
      return;
    }

    const currentAddressExists = savedAddresses.some(
      (item) => item._id === selectedAddressId,
    );

    if (!currentAddressExists) {
      const defaultAddress = savedAddresses.find(
        (item) => item.isDefault || item.isDefaultAddress,
      );

      const selected = defaultAddress || savedAddresses[0];

      setSelectedAddressId(selected._id);
      setAddress(normalizeAddress(selected));
    }
  }, [savedAddresses, loadingAddresses, selectedAddressId, useNewAddress]);

  const items = cart.items || [];

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const updateField = (event) => {
    const { name, value } = event.target;

    setAddress((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const selectSavedAddress = (savedAddress) => {
    setSelectedAddressId(savedAddress._id);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    // Validate the delivery details.
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    const missingField = requiredFields.find(
      (field) => !String(address[field] || "").trim(),
    );

    if (missingField) {
      setError("Please complete all required delivery address fields.");
      return;
    }

    setSubmitting(true);

    try {
      // Send the selected or newly entered address to the order API.
      const order = await createOrder(address);

      navigate(`/orders/${order._id}`, {
        replace: true,
        state: { orderPlaced: true },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to place your order. Please try again.",
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
            We couldn't load your saved addresses. You can still enter a new
            delivery address below.
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

              {!useNewAddress && savedAddresses.length > 0 && (
                <div className="mt-6 space-y-3">
                  {savedAddresses.map((savedAddress) => {
                    const selected = selectedAddressId === savedAddress._id;

                    return (
                      <label
                        key={savedAddress._id}
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
                          />

                          <div className="min-w-0 flex-1 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold">
                                {savedAddress.fullName}
                              </span>

                              {(savedAddress.isDefault ||
                                savedAddress.isDefaultAddress) && (
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-muted">
                              {savedAddress.phone}
                            </p>

                            <p className="mt-2 leading-6 text-muted">
                              {savedAddress.addressLine1}
                              {savedAddress.addressLine2
                                ? `, ${savedAddress.addressLine2}`
                                : ""}
                              {`, ${savedAddress.city}, ${savedAddress.state} ${savedAddress.postalCode}, ${savedAddress.country}`}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={
                    useNewAddress
                      ? () => {
                          const defaultAddress =
                            savedAddresses.find(
                              (item) => item.isDefault || item.isDefaultAddress,
                            ) || savedAddresses[0];

                          selectSavedAddress(defaultAddress);
                        }
                      : startNewAddress
                  }
                  className="mt-5 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:border-primary"
                >
                  {useNewAddress
                    ? "← Choose a saved address"
                    : "+ Add a new address"}
                </button>
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
                          autoComplete={
                            name === "fullName"
                              ? "name"
                              : name === "phone"
                                ? "tel"
                                : name === "addressLine1"
                                  ? "street-address"
                                  : name === "postalCode"
                                    ? "postal-code"
                                    : "off"
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
                  Cash on delivery (COD)
                </p>
                <p className="mt-2 text-xs text-muted">
                  Online payments are not enabled in this checkout yet.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-7 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 sm:w-auto"
              >
                {submitting ? "Placing order..." : "Place order"}
              </button>
            </section>

            <aside className="rounded-3xl border border-border bg-card/50 p-6">
              <h2 className="text-lg font-semibold">Your order</h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product?._id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-muted">
                      {item.product?.name || "Product"} × {item.quantity}
                    </span>
                    <span className="shrink-0">
                      {money((item.product?.price || 0) * item.quantity)}
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
                  The backend recalculates the final total using current product
                  prices and stock.
                </p>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}
