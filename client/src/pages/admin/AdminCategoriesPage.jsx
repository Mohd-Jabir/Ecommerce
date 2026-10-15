
import { useState } from "react";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
} from "../../hooks/useAdmin";
import AdminTable from "../../components/admin/AdminTable";
import AdminPagination from "../../components/admin/AdminPagination";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-200";

const buttonClass =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const query = useAdminCategories({
    page,
    limit: 20,
    search,
    status,
  });

  const create = useCreateAdminCategory();
  const update = useUpdateAdminCategory();
  const remove = useDeleteAdminCategory();

  const saving = create.isPending || update.isPending;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name ?? "",
      slug: category.slug ?? "",
      description: category.description ?? "",
      image: category.image ?? "",
      isActive: category.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      image: form.image.trim(),
    };

    const options = {
      onSuccess: () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
      },
    };

    if (editingId) {
      update.mutate(
        { categoryId: editingId, data: payload },
        options
      );
    } else {
      create.mutate(payload, options);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Category",
      render: (category) => (
        <div>
          <p className="font-semibold text-gray-900">
            {category.name}
          </p>
          {category.description && (
            <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
              {category.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (category) => (
        <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600">
          {category.slug || "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (category) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            category.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {category.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (category) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`${buttonClass} border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-100`}
            onClick={() => openEdit(category)}
          >
            Edit
          </button>

          <button
            type="button"
            className={`${buttonClass} border border-red-200 bg-white px-3 py-2 text-red-600 hover:bg-red-50`}
            disabled={remove.isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Delete category "${category.name}"?`
                )
              ) {
                remove.mutate(category._id);
              }
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const mutationError =
    create.error || update.error || remove.error;

  return (
    <section className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit, and manage your store categories.
          </p>
        </div>

        <button
          type="button"
          className={`${buttonClass} ${
            showForm
              ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              : "bg-gray-900 text-white hover:bg-gray-700"
          }`}
          onClick={showForm ? () => setShowForm(false) : openCreate}
        >
          {showForm ? "Close form" : "+ Add category"}
        </button>
      </div>

      {/* Create / edit form */}
      {showForm && (
        <form
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
          onSubmit={handleSubmit}
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit category" : "Create category"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the category details below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
              <input
                className={inputClass}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Electronics"
                required
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-gray-700">
              Slug
              <input
                className={inputClass}
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="Generated automatically if blank"
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-gray-700 md:col-span-2">
              Description
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe this category..."
                rows={4}
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-gray-700 md:col-span-2">
              Image URL
              <input
                className={inputClass}
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/category.jpg"
              />
            </label>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
            <input
              className="h-4 w-4 rounded border-gray-300 accent-gray-900 focus:ring-gray-900"
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Active category
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">
                Enable or disable this category.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
            <button
              type="submit"
              className={`${buttonClass} bg-gray-900 text-white hover:bg-gray-700`}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create category"}
            </button>

            <button
              type="button"
              className={`${buttonClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-100`}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <input
            className={inputClass}
            value={search}
            placeholder="Search categories..."
            aria-label="Search categories"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className={`${inputClass} sm:w-48`}
          value={status}
          aria-label="Filter categories by status"
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Mutation error */}
      {mutationError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {mutationError.message || "The category action failed."}
        </p>
      )}

      {/* Categories table */}
      <AdminTable
        columns={columns}
        rows={query.data?.items ?? []}
        loading={query.isPending}
        error={query.isError ? "Failed to load categories." : ""}
      />

      {/* Pagination */}
      <AdminPagination
        pagination={query.data?.pagination}
        onPageChange={setPage}
      />
    </section>
  );
}
