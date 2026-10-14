
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
    return <main className="p-8">Loading analytics...</main>;
  }

  if (query.isError) {
    return (
      <main className="p-8">
        <p role="alert">
          {query.error?.response?.data?.message ||
            "Unable to load analytics."}
        </p>
        <button onClick={() => query.refetch()} className="mt-3 underline">
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
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold">Sales analytics</h1>
        <p className="mt-2 text-sm text-gray-500">
          Performance for your products and orders.
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-white p-6">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value ?? 0}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Monthly sales</h2>
          {monthlySales.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No monthly sales data yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {monthlySales.map((month) => (
                <div key={month.month}>
                  <div className="flex justify-between gap-4 text-sm">
                    <span>{month.month}</span>
                    <strong>{money(month.sales)}</strong>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded bg-gray-100">
                    <div className="h-full rounded bg-gray-800"
                      style={{
                        width: `${
                          Math.min(
                            100,
                            (Number(month.sales) /
                              Math.max(
                                1,
                                ...monthlySales.map((item) => Number(item.sales))
                              )) * 100
                          )
                        }%`,
                      }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Top-selling products</h2>
          {topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No product sales yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Units sold</th>
                    <th className="p-3">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr key={product.productId ?? product._id ?? product.name}
                      className="border-t">
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{product.unitsSold ?? product.quantity ?? 0}</td>
                      <td className="p-3">{money(product.sales ?? product.revenue)}</td>
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
