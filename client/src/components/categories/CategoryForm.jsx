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
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
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
          className="mb-1.5 block text-sm font-medium"
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
          className={inputClass}
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
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
