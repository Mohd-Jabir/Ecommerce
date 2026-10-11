import { useNavigate } from "react-router-dom";
import {
  useCreateCategory,
  useUpdateCategory,
} from "../../hooks/useCategory.js";
import CategoryForm from "../../components/categories/CategoryForm.jsx";

export default function CategoryEditor({ category }) {
  const navigate = useNavigate();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isEditing = Boolean(category?._id);
  const mutation = isEditing ? updateMutation : createMutation;

  async function handleSubmit(payload) {
    if (isEditing) {
      await updateMutation.mutateAsync({
        categoryId: category._id,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    navigate(-1);
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 text-sm font-medium text-indigo-600 hover:underline"
      >
        ← Back
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {isEditing ? "Edit category" : "Create category"}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {isEditing
            ? "Update the category details."
            : "Add a category to organize products."}
        </p>

        <CategoryForm
          initialValues={category}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          submitLabel={isEditing ? "Save changes" : "Create category"}
        />
      </div>
    </main>
  );
}
