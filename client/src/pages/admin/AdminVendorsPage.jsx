import { useState } from "react";
import {
  useAdminVendors,
  useApproveAdminVendor,
  useRejectAdminVendor,
  useSuspendAdminVendor,
} from "../../hooks/useAdmin";
import AdminTable from "../../components/admin/AdminTable";
import AdminPagination from "../../components/admin/AdminPagination";

const statuses = ["pending", "approved", "rejected", "suspended"];

const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function AdminVendorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const query = useAdminVendors({ page, limit: 20, search, status });
  const approve = useApproveAdminVendor();
  const reject = useRejectAdminVendor();
  const suspend = useSuspendAdminVendor();

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

  const actionButtonClass =
    "rounded-lg px-3.5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

  const columns = [
    {
      key: "storeName",
      label: "Store",
      render: (vendor) => (
        <span className="font-semibold text-gray-900">
          {vendor.storeName || "—"}
        </span>
      ),
    },
    {
      key: "contactEmail",
      label: "Email",
      render: (vendor) => (
        <span className="text-sm text-gray-600">
          {vendor.contactEmail || "—"}
        </span>
      ),
    },
    {
      key: "contactPhone",
      label: "Phone",
      render: (vendor) => (
        <span className="text-sm text-gray-600">
          {vendor.contactPhone || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (vendor) => {
        const statusColors = {
          pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
          approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
          rejected: "bg-red-50 text-red-700 ring-1 ring-red-200",
          suspended: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
        };

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              statusColors[vendor.status] ??
              "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
            }`}
          >
            {formatStatus(vendor.status ?? "pending")}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (vendor) => {
        const isPending =
          approve.isPending || reject.isPending || suspend.isPending;

        return (
          <div className="flex flex-wrap items-center gap-2">
            {vendor.status !== "approved" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (window.confirm(`Approve ${vendor.storeName}?`)) {
                    approve.mutate(vendor._id);
                  }
                }}
                className={`${actionButtonClass} bg-orange-500 text-white hover:bg-orange-600`}
              >
                Approve
              </button>
            )}

            {vendor.status !== "rejected" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (window.confirm(`Reject ${vendor.storeName}?`)) {
                    reject.mutate(vendor._id);
                  }
                }}
                className={`${actionButtonClass} border border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50`}
              >
                Reject
              </button>
            )}

            {vendor.status !== "suspended" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (window.confirm(`Suspend ${vendor.storeName}?`)) {
                    suspend.mutate(vendor._id);
                  }
                }}
                className={`${actionButtonClass} border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-100`}
              >
                Suspend
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const actionError = approve.error || reject.error || suspend.error;

  return (
    <section className="space-y-7">
      {/* Page heading */}
      <div>
        <p className="text-sm font-semibold text-orange-600">Admin / Vendors</p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Vendors
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Review vendor applications and manage store access.
        </p>
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="vendor-search"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Search vendors
            </label>

            <input
              id="vendor-search"
              type="search"
              value={search}
              placeholder="Search vendors..."
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="vendor-status"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Filter by status
            </label>

            <select
              id="vendor-status"
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

      {/* Action errors */}
      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700"
        >
          {actionError.message || "Vendor action failed."}
        </div>
      )}

      {/* Vendors table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-gray-900">All vendors</h2>

          <p className="mt-1.5 text-sm leading-5 text-gray-500">
            Approve, reject, or suspend vendor accounts.
          </p>
        </div>

        <AdminTable
          columns={columns}
          rows={query.data?.items ?? []}
          loading={query.isPending}
          error={query.isError ? "Failed to load vendors." : ""}
        />

        {!query.isPending &&
          !query.isError &&
          (query.data?.items ?? []).length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold text-gray-900">No vendors found</p>

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
