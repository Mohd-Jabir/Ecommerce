
export default function Input({ label, error, id, type = "text", ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-800"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        {...props}
        className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors duration-200 placeholder:text-gray-400 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        }`}
      />

      {error && (
        <p className="text-sm leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
