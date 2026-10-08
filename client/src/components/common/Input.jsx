export default function Input({ label, error, id, type = "text", ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-100"
        }`}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
