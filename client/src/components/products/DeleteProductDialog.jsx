export default function DeleteProductDialog({
  product,
  isPending = false,
  onCancel,
  onConfirm,
}) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
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
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="archive-title" className="text-lg font-bold">
          Archive product?
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to archive <strong>{product.name}</strong>? It
          will no longer appear in the public product listing.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isPending ? "Archiving..." : "Archive"}
          </button>
        </div>
      </section>
    </div>
  );
}
