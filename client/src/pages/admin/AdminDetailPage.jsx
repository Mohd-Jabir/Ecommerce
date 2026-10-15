
import { useParams } from "react-router-dom";
import {
  useAdminUser,
  useAdminVendor,
  useAdminOrder,
  useAdminCategory,
} from "../../hooks/useAdmin";

const hooks = {
  user: useAdminUser,
  vendor: useAdminVendor,
  order: useAdminOrder,
  category: useAdminCategory,
};

export default function AdminDetailPage({ resource }) {
  const { id } = useParams();
  const useDetail = hooks[resource];

  if (!useDetail) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unsupported resource.
      </div>
    );
  }

  return (
    <DetailContent
      useDetail={useDetail}
      id={id}
      resource={resource}
    />
  );
}

function DetailContent({ useDetail, id, resource }) {
  const query = useDetail(id);

  if (query.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-gray-600">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <span>Loading details...</span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-700">
          Unable to load this record.
        </p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const record = query.data?.data;

  if (!record) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Record not found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          The requested {resource} record could not be found.
        </p>
      </div>
    );
  }

  const title = `${resource[0].toUpperCase()}${resource.slice(1)} details`;

  const formatKey = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (char) => char.toUpperCase());

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium capitalize text-blue-600">
          Admin / {resource}
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View the details for this {resource} record.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Record information
          </h2>
        </div>

        <dl className="divide-y divide-gray-100">
          {Object.entries(record).map(([key, value]) => {
            if (key === "__v" || key === "passwordHash") {
              return null;
            }

            const displayValue = formatValue(value);

            return (
              <div
                key={key}
                className="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-3 sm:gap-6"
              >
                <dt className="text-sm font-semibold text-gray-600">
                  {formatKey(key)}
                </dt>

                <dd className="min-w-0 whitespace-pre-wrap break-words text-sm text-gray-900 sm:col-span-2">
                  {typeof value === "object" &&
                  value !== null &&
                  value !== "" ? (
                    <pre className="overflow-x-auto rounded-md bg-gray-50 p-3 font-mono text-xs leading-5 text-gray-800">
                      {displayValue}
                    </pre>
                  ) : (
                    displayValue
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
