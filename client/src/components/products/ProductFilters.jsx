export default function ProductFilters({ filters, onChange, categories = [] }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value, page: 1 });
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input
        aria-label="Search products"
        className={inputClass}
        placeholder="Search products..."
        value={filters.search || ""}
        onChange={(e) => update("search", e.target.value)}
      />

      <select
        aria-label="Filter by category"
        className={inputClass}
        value={filters.category || ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category._id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        aria-label="Minimum price"
        type="number"
        min="0"
        className={inputClass}
        placeholder="Min price"
        value={filters.minPrice ?? ""}
        onChange={(e) => update("minPrice", e.target.value)}
      />

      <input
        aria-label="Maximum price"
        type="number"
        min="0"
        className={inputClass}
        placeholder="Max price"
        value={filters.maxPrice ?? ""}
        onChange={(e) => update("maxPrice", e.target.value)}
      />

      <select
        aria-label="Sort products"
        className={inputClass}
        value={filters.sort || "newest"}
        onChange={(e) => update("sort", e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="rating">Top rated</option>
        <option value="popular">Most popular</option>
      </select>
    </section>
  );
}
