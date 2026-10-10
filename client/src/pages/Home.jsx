import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {user && (
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back,{" "}
            <Link
              to="/account"
              className="underline decoration-gray-400 underline-offset-4 hover:text-gray-600"
            >
              {user.name}
            </Link>
          </h1>
        )}
      </div>
    </main>
  );
}
