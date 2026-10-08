import { useAuth } from "../hooks/useAuth.js";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Ecommerce
          </h1>

          {user ? (
            <>
              <p className="mt-3 text-gray-600">
                Welcome, {user.name}
              </p>

              <button
                onClick={logout}
                className="mt-6 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <p className="mt-3 text-gray-600">
              Welcome to our ecommerce store.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}