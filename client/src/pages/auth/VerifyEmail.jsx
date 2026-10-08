import VerifyEmailComponent from "../../components/auth/VerifyEmail.jsx";

export default function VerifyEmail() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Email verification
          </h1>
        </div>

        <VerifyEmailComponent />
      </div>
    </div>
  );
}