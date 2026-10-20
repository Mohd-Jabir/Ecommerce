import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center bg-gray-50 px-5 py-16 text-center">
      <div className="w-full max-w-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-3xl font-semibold text-orange-500">
          !
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
          Page not found
        </p>

        <h1 className="mt-3 text-7xl font-extrabold tracking-tight text-gray-900 sm:text-8xl">
          404<span className="text-orange-500">.</span>
        </h1>

        <h2 className="mt-5 text-xl font-bold text-gray-900 sm:text-2xl">
          Looks like you've lost your way.
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-gray-500 sm:text-base">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back to shopping.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98]"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
          >
            Browse products
          </Link>
        </div>

        <div className="mx-auto mt-12 h-px max-w-xs bg-gray-200" />

        <p className="mt-5 text-xs font-medium text-gray-400">
          Lost? Your next great find is just a click away.
        </p>
      </div>
    </div>
  );
}