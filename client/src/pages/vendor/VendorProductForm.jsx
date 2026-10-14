import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useVendorProduct,
  useCreateVendorProduct,
  useUpdateVendorProduct,
} from "../../hooks/useVendorProducts.js";

const initialForm = {
  name: "",
  description: "",
  sku: "",
  price: "",
  stock: "",
  category: "",
  imagesText: "",
  status: "draft",
};

export default function VendorProductForm() {
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();

  const productQuery = useVendorProduct(productId);
  const createMutation = useCreateVendorProduct();
  const updateMutation = useUpdateVendorProduct();
  const mutation = isEditing ? updateMutation : createMutation;

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!productQuery.data) return;
    const product = productQuery.data;

    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      sku: product.sku ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      category: product.category?._id ?? product.category ?? "",
      imagesText: (product.images ?? []).join("\n"),
      status: product.status ?? "draft",
    });
  }, [productQuery.data]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category.trim(),
      images: form.imagesText
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
      status: form.status,
    };

    const onSuccess = () => navigate("/vendor/products");

    if (isEditing) {
      updateMutation.mutate({ productId, payload }, { onSuccess });
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  }

  if (isEditing && productQuery.isLoading) {
    return <main className="p-8">Loading product...</main>;
  }

  if (isEditing && productQuery.isError) {
    return (
      <main className="p-8">
        {productQuery.error?.response?.data?.message ||
          "Unable to load this product."}
      </main>
    );
  }

  const fields = [
    ["name", "Product name", "text"],
    ["sku", "SKU", "text"],
    ["price", "Price (INR)", "number"],
    ["stock", "Stock quantity", "number"],
    ["category", "Category ID", "text"],
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6">
        <Link to="/vendor/products" className="text-sm underline">
          ← Back to products
        </Link>

        <h1 className="mt-5 text-2xl font-bold">
          {isEditing ? "Edit product" : "Add product"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {fields.map(([name, label, type]) => (
            <div key={name}>
              <label htmlFor={name} className="mb-1 block text-sm font-medium">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required
                min={type === "number" ? 0 : undefined}
                step={
                  name === "price"
                    ? "0.01"
                    : type === "number"
                      ? "1"
                      : undefined
                }
                className="w-full rounded-lg border px-3 py-2.5"
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label
              htmlFor="imagesText"
              className="mb-1 block text-sm font-medium"
            >
              Image URLs (one URL per line)
            </label>
            <textarea
              id="imagesText"
              name="imagesText"
              value={form.imagesText}
              onChange={handleChange}
              rows={4}
              placeholder="https://example.com/product.jpg"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {mutation.isError && (
            <p role="alert" className="text-sm text-red-600">
              {mutation.error?.response?.data?.message ||
                "Unable to save product."}
            </p>
          )}

          <button
            disabled={mutation.isPending}
            className="rounded-lg bg-gray-900 px-5 py-3 text-white disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Save product"}
          </button>
        </form>
      </div>
    </main>
  );
}
