import { Link } from "react-router-dom";
import { useWishlist } from "../../hooks/useWishlist.js";
import WishlistButton from "../../components/wishlist/WishlistButton.jsx";

export default function WishlistPage() {
  const { data, isPending, isError, error } = useWishlist();
  const products = data?.products ?? [];

  if (isPending) {
    return (
      <p className="bg-gray-50 p-10 text-center text-sm text-gray-500">
        Loading your wishlist...
      </p>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl bg-gray-50 px-4 py-12 sm:p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Wishlist unavailable
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {error.response?.status === 401
              ? "Please log in to view your wishlist."
              : "Please try again later."}
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-gray-50 px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        My Wishlist
      </h1>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-600">Your wishlist is empty.</p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Discover products
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product._id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link to={`/products/${product.slug}`}>
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="h-full w-full rounded-xl object-contain p-3 transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">
                      No image available
                    </span>
                  )}
                </div>

                <h2 className="mt-4 line-clamp-2 font-semibold text-gray-900 transition-colors hover:text-orange-600">
                  {product.name}
                </h2>
              </Link>

              <p className="mt-2 text-lg font-bold text-gray-900">
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
