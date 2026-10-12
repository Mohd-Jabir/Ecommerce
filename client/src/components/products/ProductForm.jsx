import { useEffect, useState } from "react";
import { useCategories } from "../../hooks/useCategory.js";
import ImageKitImageUpload from "../common/ImageKitImageUpload.jsx";

const emptyForm = {
  name: "",
  description: "",
  sku: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  category: "",
  status: "active",
  images: [{ url: "", alt: "" }],
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-indigo-500";

export default function ProductForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save product",
  allowStatus = true,
}) {
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data || [];

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialValues) {
      setForm({
        ...emptyForm,
        images: [{ url: "", alt: "" }],
      });
      return;
    }

    setForm({
      name: initialValues.name ?? "",
      description: initialValues.description ?? "",
      sku: initialValues.sku ?? "",
      price: String(initialValues.price ?? ""),
      compareAtPrice:
        initialValues.compareAtPrice == null
          ? ""
          : String(initialValues.compareAtPrice),
      stock: String(initialValues.stock ?? 0),
      category: initialValues.category?._id ?? initialValues.category ?? "",
      status: initialValues.status ?? "active",
      images:
        initialValues.images?.length > 0
          ? initialValues.images.map((image) => ({
              url: image.url ?? "",
              alt: image.alt ?? "",
            }))
          : [{ url: "", alt: "" }],
    });
  }, [initialValues]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateImage(index, field, value) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, i) =>
        i === index ? { ...image, [field]: value } : image,
      ),
    }));
  }

  function addImage() {
    if (form.images.length >= 10) return;

    update("images", [...form.images, { url: "", alt: "" }]);
  }

  function removeImage(index) {
    update(
      "images",
      form.images.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const price = Number(form.price);
    const stock = Number(form.stock);
    const compareAtPrice =
      form.compareAtPrice === "" ? null : Number(form.compareAtPrice);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid non-negative price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    if (
      compareAtPrice !== null &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)
    ) {
      setError("Enter a valid compare-at price.");
      return;
    }

    const images = form.images
      .map((image) => ({
        url: image.url.trim(),
        alt: image.alt.trim(),
      }))
      .filter((image) => image.url);

    if (images.some((image) => !/^https?:\/\/\S+$/i.test(image.url))) {
      setError("Every image must have a valid HTTP or HTTPS URL.");
      return;
    }

    if (images.length > 10) {
      setError("You can add up to 10 images.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      sku: form.sku.trim(),
      price,
      compareAtPrice,
      stock,
      category: form.category,
      images,
    };

    if (allowStatus) {
      payload.status = form.status;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the product. Check your input and try again.",
      );
    }
  }

  if (categoriesQuery.isPending) {
    return <p className="text-sm text-gray-500">Loading categories...</p>;
  }

  if (categoriesQuery.isError) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Could not load categories. Refresh and try again.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Product name *
        </label>
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          minLength={2}
          maxLength={150}
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Description *
        </label>
        <textarea
          className={inputClass}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          maxLength={10000}
          rows={5}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">SKU *</label>
          <input
            className={inputClass}
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            maxLength={80}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Category *</label>
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Price (₹) *
          </label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Compare-at price (₹)
          </label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={form.compareAtPrice}
            onChange={(e) => update("compareAtPrice", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Stock quantity *
          </label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            required
          />
        </div>

        {allowStatus && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Product images</h3>
          <button
            type="button"
            onClick={addImage}
            disabled={form.images.length >= 10}
            className="text-sm font-medium text-indigo-600 disabled:opacity-50"
          >
            + Add image
          </button>
        </div>

        {form.images.map((image, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-gray-200 p-3"
          >
            <ImageKitImageUpload
              label={`Product image ${index + 1}`}
              folder="/ecommerce/products"
              value={image.url}
              onChange={(url) => updateImage(index, "url", url)}
            />

            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor={`image-alt-${index}`}
              >
                Alt text
              </label>
              <input
                id={`image-alt-${index}`}
                className={inputClass}
                placeholder="Describe the product image"
                value={image.alt}
                onChange={(e) => updateImage(index, "alt", e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => removeImage(index)}
              className="text-sm text-red-600"
            >
              Remove image
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
