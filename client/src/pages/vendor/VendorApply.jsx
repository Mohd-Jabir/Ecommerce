import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApplyToBecomeVendor } from "../../hooks/useVendor.js";

const LOCATION_API = "https://lgd-json-api.vercel.app/api";

const initialForm = {
  storeName: "",
  description: "",
  contactEmail: "",
  contactPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

function getName(item) {
  return (
    item?.name ??
    item?.stateName ??
    item?.cityName ??
    item?.localBodyName ??
    item?.state_name ??
    item?.city_name ??
    ""
  );
}

function getCode(item) {
  return String(
    item?.stateCode ??
      item?.state_code ??
      item?.code ??
      item?.lgdCode ??
      item?.id ??
      "",
  );
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Location request failed (${response.status}).`);
  }

  return response.json();
}

export default function VendorApply() {
  const [form, setForm] = useState(initialForm);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [statesError, setStatesError] = useState("");
  const [citiesError, setCitiesError] = useState("");

  const applyMutation = useApplyToBecomeVendor();

  // Load states and union territories.
  useEffect(() => {
    const controller = new AbortController();

    async function loadStates() {
      try {
        setStatesLoading(true);
        setStatesError("");

        const result = await fetchJson(`${LOCATION_API}/states?limit=100`);

        const items = Array.isArray(result) ? result : result.data;

        if (!Array.isArray(items)) {
          throw new Error("Unexpected states API response.");
        }

        const normalized = items
          .map((item) => ({
            name: getName(item),
            code: getCode(item),
          }))
          .filter((item) => item.name && item.code);

        if (normalized.length === 0) {
          throw new Error("No states were returned.");
        }

        setStates(normalized);
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatesError("Unable to load states. Please retry.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setStatesLoading(false);
        }
      }
    }

    loadStates();

    return () => controller.abort();
  }, []);

  // Load cities whenever the selected state changes.
  useEffect(() => {
    if (!form.state) {
      setCities([]);
      setCitiesError("");
      setCitiesLoading(false);
      return;
    }

    const selectedState = states.find((item) => item.name === form.state);

    if (!selectedState) return;

    const controller = new AbortController();

    async function loadCities() {
      try {
        setCitiesLoading(true);
        setCitiesError("");
        setCities([]);

        const allItems = [];
        let page = 1;
        let totalPages = 1;

        do {
          const params = new URLSearchParams({
            stateCode: selectedState.code,
            page: String(page),
            limit: "100",
          });

          const response = await fetch(`${LOCATION_API}/cities?${params}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`City request failed (${response.status}).`);
          }

          const result = await response.json();

          const items = Array.isArray(result) ? result : result.data;

          if (!Array.isArray(items)) {
            throw new Error("Unexpected cities API response.");
          }

          allItems.push(...items);

          totalPages = Number(result.pagination?.pages) || 1;
          page += 1;
        } while (page <= totalPages);

        const uniqueCities = [
          ...new Set(
            allItems
              .map(getName)
              .map((name) => name.trim())
              .filter(Boolean),
          ),
        ].sort((a, b) => a.localeCompare(b));

        setCities(uniqueCities);
      } catch (error) {
        if (error.name !== "AbortError") {
          setCitiesError("Unable to load cities. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCitiesLoading(false);
        }
      }
    }

    loadCities();

    return () => controller.abort();
  }, [form.state, states]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleStateChange(event) {
    const state = event.target.value;

    setForm((current) => ({
      ...current,
      state,
      city: "",
    }));

    setCities([]);
    setCitiesError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    applyMutation.mutate({
      storeName: form.storeName.trim(),
      description: form.description.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      businessAddress: {
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: "India",
      },
    });
  }

  const errorMessage =
    applyMutation.error?.response?.data?.message ||
    applyMutation.error?.message ||
    "Unable to submit your application.";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <Link
          to="/"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600"
        >
          ← Back to home
        </Link>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900">
          Become a seller
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-600">
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
              className="mb-1 block text-sm font-semibold text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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

          <h2 className="border-t border-gray-200 pt-5 text-lg font-bold text-gray-900">
            Business address
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Address line 1"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              maxLength={200}
            />

            <Field
              label="Address line 2 (optional)"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              maxLength={200}
            />

            <div>
              <label
                htmlFor="country"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Country
              </label>

              <input
                id="country"
                value="India"
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                State / Union territory
              </label>

              <select
                id="state"
                name="state"
                value={form.state}
                onChange={handleStateChange}
                required
                disabled={statesLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {statesLoading ? "Loading states..." : "Select state"}
                </option>

                {states.map((item) => (
                  <option key={item.code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>

              {statesError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {statesError}
                </p>
              )}

              {statesError && (
                <button
                  type="button"
                  onClick={() => {
                    setStates([]);
                    setStatesError("");
                    setStatesLoading(true);
                    window.location.reload();
                  }}
                  className="mt-1 text-sm font-medium text-orange-600 underline underline-offset-4 transition-colors hover:text-orange-700"
                >
                  Reload page to retry
                </button>
              )}
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                City / Town
              </label>

              <select
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                disabled={
                  !form.state ||
                  citiesLoading ||
                  Boolean(citiesError) ||
                  cities.length === 0
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {!form.state
                    ? "Select a state first"
                    : citiesLoading
                      ? "Loading cities..."
                      : citiesError
                        ? "Unable to load cities"
                        : cities.length === 0
                          ? "No cities available"
                          : "Select city"}
                </option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {citiesError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {citiesError}
                </p>
              )}
            </div>

            <Field
              label="PIN code"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="e.g. 211001"
            />
          </div>

          {applyMutation.isSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Application submitted. You can check your status in your{" "}
              <Link
                to="/vendor/profile"
                className="font-semibold underline underline-offset-4 hover:text-emerald-900"
              >
                vendor profile
              </Link>
              .
            </div>
          )}

          {applyMutation.isError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={applyMutation.isPending || statesLoading || citiesLoading}
            className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
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
        className="mb-1 block text-sm font-semibold text-gray-700"
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
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}
