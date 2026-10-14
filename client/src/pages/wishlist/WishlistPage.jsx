import { Link } from "react-router-dom";
import { useWishlist } from "../../hooks/useWishlist.js";
import WishlistButton from "../../components/wishlist/WishlistButton.jsx";

export default function WishlistPage() {
  const { data, isPending, isError, error } = useWishlist();
  const products = data?.products ?? [];

  if (isPending) {
    return <p className="p-10 text-center">Loading your wishlist...</p>;
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-4xl p-8 text-center">
        <h1 className="text-2xl font-bold">Wishlist unavailable</h1>
        <p className="mt-2 text-gray-500">
          {error.response?.status === 401
            ? "Please log in to view your wishlist."
            : "Please try again later."}
        </p>
        <Link
          to="/products"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Wishlist</h1>

      {products.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <p className="text-gray-600">Your wishlist is empty.</p>
          <Link
            to="/products"
            className="mt-4 inline-block text-indigo-600 hover:underline"
          >
            Discover products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product._id}
              className="overflow-hidden rounded-xl border bg-white p-4"
            >
              <Link to={`/products/${product.slug}`}>
                <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-50">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="h-full w-full rounded-lg object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">No image available</span>
                  )}
                </div>

                <h2 className="mt-4 font-semibold text-gray-900">
                  {product.name}
                </h2>
              </Link>

              <p className="mt-2 text-lg font-bold">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>

              <div className="mt-4">
                <WishlistButton productId={product._id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
