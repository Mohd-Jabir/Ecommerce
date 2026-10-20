import { useVendorAnalytics } from "../../hooks/useVendorAnalytics.js";

function money(value) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default function VendorAnalytics() {
  const query = useVendorAnalytics();

  if (query.isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-sm text-gray-500">
        Loading analytics...
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p role="alert" className="text-sm text-red-600">
          {query.error?.response?.data?.message || "Unable to load analytics."}
        </p>
        <button
          onClick={() => query.refetch()}
          className="mt-3 text-sm font-semibold text-orange-600 underline underline-offset-4 transition-colors hover:text-orange-700"
        >
          Retry
        </button>
      </main>
    );
  }

  const result = query.data ?? {};
  const stats = result.stats ?? {};
  const topProducts = result.topProducts ?? [];
  const monthlySales = result.monthlySales ?? [];

  const cards = [
    ["Orders", stats.totalOrders],
    ["Units sold", stats.unitsSold],
    ["Gross sales", money(stats.grossSales)],
    ["Collected revenue", money(stats.collectedRevenue)],
    ["Average order value", money(stats.averageOrderValue)],
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
            Store performance
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Sales analytics
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Performance for your products and orders.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
            >
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="mt-3 break-words text-2xl font-bold tracking-tight text-gray-900">
                {value ?? 0}
              </p>
              <div className="mt-4 h-1 w-10 rounded-full bg-orange-400" />
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Monthly sales</h2>
            <p className="mt-1 text-sm text-gray-500">
              Review your sales performance month by month.
            </p>
          </div>

          {monthlySales.length === 0 ? (
            <p className="mt-5 rounded-lg bg-gray-50 px-4 py-6 text-sm text-gray-500">
              No monthly sales data yet.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {monthlySales.map((month) => (
                <div key={month.month}>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-medium text-gray-700">
                      {month.month}
                    </span>
                    <strong className="text-gray-900">
                      {money(month.sales)}
                    </strong>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (Number(month.sales) /
                            Math.max(
                              1,
                              ...monthlySales.map((item) => Number(item.sales)),
                            )) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Top-selling products
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Products ranked by their sales performance.
            </p>
          </div>

          {topProducts.length === 0 ? (
            <p className="mt-5 rounded-lg bg-gray-50 px-4 py-6 text-sm text-gray-500">
              No product sales yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Product
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Units sold
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Sales
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topProducts.map((product) => (
                    <tr
                      key={product.productId ?? product._id ?? product.name}
                      className="transition-colors duration-150 hover:bg-orange-50/40"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {product.unitsSold ?? product.quantity ?? 0}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {money(product.sales ?? product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
