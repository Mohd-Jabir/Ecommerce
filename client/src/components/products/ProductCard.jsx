import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-gray-100">
          {image?.url ? (
            <img
              src={image.url}
              alt={image.alt || product.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image available
            </div>
          )}
        </div>

        <div className="space-y-2 p-4">
          <h2 className="line-clamp-2 font-semibold text-gray-900">
            {product.name}
          </h2>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>

            {product.compareAtPrice != null &&
              product.compareAtPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
                </span>
              )}
          </div>

          {product.ratingsCount > 0 && (
            <p className="text-sm text-amber-600">
              ★ {Number(product.averageRating).toFixed(1)}
              <span className="ml-1 text-gray-500">
                ({product.ratingsCount} reviews)
              </span>
            </p>
          )}

          <p className="text-sm text-gray-500">
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </p>
        </div>
      </Link>
    </article>
  );
}
