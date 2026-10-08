export default function Button({
  children,
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      {...props}
      className="flex w-full items-center justify-center rounded-xl bg-[#FF6B4A] px-4 py-3 font-semibold text-white transition hover:bg-[#e95d3f] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
