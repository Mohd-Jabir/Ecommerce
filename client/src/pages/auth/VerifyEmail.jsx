import VerifyEmailComponent from "../../components/auth/VerifyEmail.jsx";

export default function VerifyEmail() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Email verification
          </h1>
        </div>

        <VerifyEmailComponent />
      </div>
    </div>
  );
}