export default function DeleteProductDialog({
  product,
  isPending = false,
  onCancel,
  onConfirm,
}) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-title"
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-7"
      >
        <h2
          id="archive-title"
          className="text-lg font-bold tracking-tight text-gray-900"
        >
          Archive product?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Are you sure you want to archive <strong className="font-semibold text-gray-900">{product.name}</strong>? It
          will no longer appear in the public product listing.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Archiving..." : "Archive"}
          </button>
        </div>
      </section>
    </div>
  );
}