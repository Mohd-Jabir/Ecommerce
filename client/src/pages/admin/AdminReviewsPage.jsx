import { useState } from "react";
import {
  useAdminReviews,
  useApproveAdminReview,
  useDeleteAdminReview,
} from "../../hooks/useAdmin";
import AdminTable from "../../components/admin/AdminTable";
import AdminPagination from "../../components/admin/AdminPagination";

const statuses = ["pending", "approved", "rejected"];

const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const query = useAdminReviews({ page, limit: 20, search, status });
  const approve = useApproveAdminReview();
  const remove = useDeleteAdminReview();

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (review) => (
        <span className="font-semibold text-gray-900">
          {review.title || "Untitled review"}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (review) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
          <span className="text-amber-500">★</span>
          {review.rating ?? 0}/5
        </span>
      ),
    },
    {
      key: "comment",
      label: "Comment",
      render: (review) => (
        <span className="block max-w-xs whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
          {review.comment || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (review) => {
        const statusColors = {
          pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
          approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
          rejected: "bg-red-50 text-red-700 ring-1 ring-red-200",
        };

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              statusColors[review.status] ??
              "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
            }`}
          >
            {formatStatus(review.status ?? "pending")}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (review) => (
        <div className="flex flex-wrap items-center gap-2">
          {review.status !== "approved" && (
            <button
              type="button"
              disabled={approve.isPending}
              onClick={() => {
                if (window.confirm("Approve this review?")) {
                  approve.mutate(review._id);
                }
              }}
              className="rounded-lg bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {approve.isPending ? "Processing..." : "Approve"}
            </button>
          )}

          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm("Delete this review?")) {
                remove.mutate(review._id);
              }
            }}
            className="rounded-lg border border-red-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {remove.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-7">
      {/* Page heading */}
      <div>
        <p className="text-sm font-semibold text-orange-600">
          Admin / Reviews
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Product reviews
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Review customer feedback and manage review approvals.
        </p>
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="review-search"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Search reviews
            </label>

            <input
              id="review-search"
              type="search"
              value={search}
              placeholder="Search reviews..."
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="review-status"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Filter by status
            </label>

            <select
              id="review-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All statuses</option>

              {statuses.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mutation errors */}
      {(approve.isError || remove.isError) && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700"
        >
          {approve.error?.message ||
            remove.error?.message ||
            "Review action failed. Please try again."}
        </div>
      )}

      {/* Reviews table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-gray-900">
            All reviews
          </h2>

          <p className="mt-1.5 text-sm leading-5 text-gray-500">
            Approve reviews or remove inappropriate feedback.
          </p>
        </div>

        <AdminTable
          columns={columns}
          rows={query.data?.items ?? []}
          loading={query.isPending}
          error={query.isError ? "Failed to load reviews." : ""}
        />

        {!query.isPending &&
          !query.isError &&
          (query.data?.items ?? []).length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold text-gray-900">
                No reviews found
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          )}
      </div>

      {/* Pagination */}
      <AdminPagination
        pagination={query.data?.pagination}
        onPageChange={setPage}
      />
    </section>
  );
}