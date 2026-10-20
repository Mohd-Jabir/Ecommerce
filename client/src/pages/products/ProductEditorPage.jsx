import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import ProductForm from "../../components/products/ProductForm.jsx";
import { useCreateProduct, useUpdateProduct } from "../../hooks/useProduct.js";

export default function ProductEditorPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isEditing = Boolean(productId);
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (isEditing && !product) {
      // The edit page needs product data from the management page.
      // If opened directly, the management list can be used to find it.
      navigate(-1);
    }
  }, [isEditing, product, navigate]);

  if (isEditing && !product) return null;

  async function handleSubmit(payload) {
    if (isEditing) {
      await updateMutation.mutateAsync({
        productId,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    navigate(-1);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to={-1}
        onClick={(event) => {
          event.preventDefault();
          navigate(-1);
        }}
        className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
      >
        ← Back
      </Link>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          {isEditing ? "Edit product" : "Add product"}
        </h1>
        <p className="mb-6 text-sm leading-6 text-gray-500">
          Enter the product information below.
        </p>

        <ProductForm
          initialValues={product}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          submitLabel={isEditing ? "Save changes" : "Create product"}
        />
      </div>
    </main>
  );
}