import { useLocation, useParams } from "react-router-dom";
import CategoryEditor from "../../components/categories/CategoryEditor.jsx";

export default function CategoryEditorPage() {
  const { categoryId } = useParams();
  const { state } = useLocation();

  const category = categoryId ? state?.category : undefined;

  if (categoryId && !category) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Category details unavailable
        </h1>
        <p className="mt-2 text-gray-600">
          Open the category from Manage Categories to edit it.
        </p>
      </main>
    );
  }

  return <CategoryEditor category={category} />;
}
