import { useWishlist, useWishlistMutation } from "../../hooks/useWishlist.js";

export default function WishlistButton({ productId }) {
  const wishlistQuery = useWishlist();
  const { addMutation, removeMutation } = useWishlistMutation();

  const products = wishlistQuery.data?.products ?? [];

  const isWishlisted = products.some((product) => product._id === productId);

  const isPending = addMutation.isPending || removeMutation.isPending;

  const error = addMutation.error || removeMutation.error;

  function handleToggle() {
    if (isPending) return;

    if (isWishlisted) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
  }

  if (wishlistQuery.isPending) {
    return (
      <button
        type="button"
        disabled
        className="rounded-lg border px-4 py-3 text-gray-400"
      >
        Loading wishlist...
      </button>
    );
  }

  if (wishlistQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        {wishlistQuery.error?.response?.status === 401
          ? "Log in to use your wishlist."
          : "Unable to load your wishlist."}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={isWishlisted}
        className={`rounded-lg border px-5 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isWishlisted
            ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
        }`}
      >
        {isPending
          ? "Please wait..."
          : isWishlisted
            ? "♥ Remove from Wishlist"
            : "♡ Add to Wishlist"}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error.response?.data?.message ||
            "Unable to update your wishlist. Please try again."}
        </p>
      )}
    </div>
  );
}
