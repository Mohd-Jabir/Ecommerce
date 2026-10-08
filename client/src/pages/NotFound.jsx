import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-gray-900">404</h1>

      <p className="mt-4 text-gray-500">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-xl bg-[#FF6B4A] px-5 py-3 font-semibold text-white"
      >
        Go home
      </Link>
    </div>
  );
}
