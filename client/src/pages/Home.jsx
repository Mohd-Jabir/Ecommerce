
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Section 1: Hero */}
      <section className="flex min-h-[65vh] items-center justify-center px-6 py-16 text-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B4A]">
            Welcome to Our Store
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Discover Products
            <span className="block text-[#FF6B4A]">
              You’ll Love.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Explore a collection of amazing products from
            different sellers, all in one place.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-block rounded-xl bg-[#FF6B4A] px-8 py-3 font-medium text-white transition hover:bg-[#e95b3c]"
          >
            Browse Products
          </Link>
        </div>
      </section>

      {/* Section 2: Featured */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything You Need, in One Place
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Discover great products, explore different
            categories, and enjoy a simple shopping experience.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block font-semibold text-[#FF6B4A] transition hover:text-[#e95b3c]"
          >
            Explore the Store →
          </Link>
        </div>
      </section>
    </main>
  );
}

