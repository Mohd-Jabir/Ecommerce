import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addCartItem } from "../../api/cart.api.js";

export default function AddToCartButton({ product }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const outOfStock = !product || Number(product.stock) < 1;

  async function handleAdd() {
    if (loading || outOfStock) return;

    setLoading(true);
    setError("");

    try {
      await addCartItem(product._id, 1);
      navigate("/cart");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to add this product to your cart.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading || outOfStock}
        className="w-full rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
      >
        {loading ? "Adding..." : outOfStock ? "Out of stock" : "Add to cart"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}