import { useState } from "react";
import {
  useAdminUsers,
  useUpdateAdminUserStatus,
  useDeleteAdminUser,
} from "../../hooks/useAdmin";
import AdminTable from "../../components/admin/AdminTable";
import AdminPagination from "../../components/admin/AdminPagination";

const statuses = ["active", "suspended", "banned", "deactivated"];

const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const query = useAdminUsers({ page, limit: 20, search, status });
  const updateStatus = useUpdateAdminUserStatus();
  const deleteUser = useDeleteAdminUser();

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (user) => (
        <span className="font-semibold text-gray-900">
          {user.name || "—"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (user) => (
        <span className="text-sm text-gray-600">
          {user.email || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (user) => (
        <span className="text-sm text-gray-600">
          {user.phone || "—"}
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (user) => {
        const roleColors = {
          admin: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
          vendor: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
          customer: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
        };

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              roleColors[user.role] ?? "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
            }`}
          >
            {formatStatus(user.role ?? "customer")}
          </span>
        );
      },
    },
    {
      key: "accountStatus",
      label: "Account status",
      render: (user) => {
        const statusColors = {
          active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
          suspended: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
          banned: "bg-red-50 text-red-700 ring-1 ring-red-200",
          deactivated: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
        };

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              statusColors[user.accountStatus] ??
              "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
            }`}
          >
            {formatStatus(user.accountStatus ?? "active")}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={user.accountStatus ?? "active"}
            disabled={updateStatus.isPending}
            aria-label={`Account status for ${user.name ?? user.email}`}
            onChange={(event) =>
              updateStatus.mutate({
                userId: user._id,
                status: event.target.value,
              })
            }
            className="min-w-32 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {formatStatus(value)}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={deleteUser.isPending || user.role === "admin"}
            title={
              user.role === "admin"
                ? "Admin accounts cannot be deleted here"
                : "Delete user"
            }
            onClick={() => {
              if (window.confirm(`Delete user ${user.name}?`)) {
                deleteUser.mutate(user._id);
              }
            }}
            className="rounded-lg border border-red-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteUser.isPending ? "Deleting..." : "Delete"}
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
          Admin / Users
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Users
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Manage user accounts, account statuses, and roles.
        </p>
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="user-search"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Search users
            </label>

            <input
              id="user-search"
              type="search"
              value={search}
              placeholder="Search name, email, phone..."
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="user-status"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Filter by account status
            </label>

            <select
              id="user-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All account statuses</option>

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
      {(updateStatus.isError || deleteUser.isError) && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700"
        >
          {updateStatus.error?.message ||
            deleteUser.error?.message ||
            "User action failed. Please try again."}
        </div>
      )}

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-gray-900">
            All users
          </h2>

          <p className="mt-1.5 text-sm leading-5 text-gray-500">
            View user information and manage account access.
          </p>
        </div>

        <AdminTable
          columns={columns}
          rows={query.data?.items ?? []}
          loading={query.isPending}
          error={query.isError ? "Failed to load users." : ""}
        />

        {!query.isPending &&
          !query.isError &&
          (query.data?.items ?? []).length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="font-semibold text-gray-900">
                No users found
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or account status filter.
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