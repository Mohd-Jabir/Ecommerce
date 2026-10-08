import ResetPasswordForm from "../../components/auth/ResetPasswordForm.jsx";

export default function ResetPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Reset password
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create a new password for your account.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}