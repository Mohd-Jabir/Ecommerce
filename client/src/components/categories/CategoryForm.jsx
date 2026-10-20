import { useEffect, useState } from "react";
import ImageKitImageUpload from "../common/ImageKitImageUpload.jsx";

const emptyForm = {
  name: "",
  description: "",
  image: "",
};

export default function CategoryForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save category",
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      image: initialValues?.image ?? "",
    });
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.name.trim().length < 2) {
      setError("Category name must contain at least 2 characters.");
      return;
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save category. Please try again.",
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-semibold text-gray-800"
        >
          Category name *
        </label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          minLength={2}
          maxLength={80}
          required
          className={inputClass}
          placeholder="e.g. Electronics"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-semibold text-gray-800"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          maxLength={500}
          rows={4}
          className={`${inputClass} resize-y`}
          placeholder="Describe this category..."
        />
      </div>

      <ImageKitImageUpload
        label="Category image"
        folder="/ecommerce/categories"
        value={form.image}
        onChange={(url) => setForm((current) => ({ ...current, image: url }))}
      />

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}