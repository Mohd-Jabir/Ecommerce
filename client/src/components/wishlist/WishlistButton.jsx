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
        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-400 disabled:cursor-not-allowed"
      >
        Loading wishlist...
      </button>
    );
  }

  if (wishlistQuery.isError) {
    return (
      <p className="text-sm leading-5 text-red-600">
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
        className={`inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50 ${
          isWishlisted
            ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
            : "border-gray-300 bg-white text-gray-800 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
        }`}
      >
        {isPending
          ? "Please wait..."
          : isWishlisted
            ? "♥ Remove from Wishlist"
            : "♡ Add to Wishlist"}
      </button>

      {error && (
        <p className="text-sm leading-5 text-red-600">
          {error.response?.data?.message ||
            "Unable to update your wishlist. Please try again."}
        </p>
      )}
    </div>
  );
}