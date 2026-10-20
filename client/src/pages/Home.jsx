import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              

              <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                Shopping that feels
                <span className="block text-orange-500">a little more simple.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-gray-500 sm:text-lg">
                Discover products from multiple sellers, compare your options,
                and find what fits your needs — all in one convenient place.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 active:scale-[0.98]"
                >
                  Start shopping
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
                >
                  Explore the marketplace
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-100 pt-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    ✓
                  </span>
                  Multiple sellers
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                    ✓
                  </span>
                  One convenient marketplace
                </span>
              </div>
            </div>

            {/* Typographic visual — no image or fabricated product */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-orange-50/80" />

              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      The shopping experience
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-gray-900">
                      Everything starts here.
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-xl text-orange-600">
                    ↗
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <p className="text-sm font-medium text-gray-500">
                    One destination.
                  </p>

                  <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                    More choice.
                    <span className="block text-orange-500">
                      Less hassle.
                    </span>
                  </h2>

                  <div className="my-7 h-px bg-gray-100" />

                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg text-gray-700">
                        <span aria-hidden="true">⌕</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Find what you need
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          Browse the available products in one place.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">
                        <span aria-hidden="true">◇</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Explore different sellers
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          Discover the variety a multi-vendor marketplace offers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                        <span aria-hidden="true">✓</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Shop in one place
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          Move from discovery to your shopping cart.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/products"
                    className="mt-8 flex w-full items-center justify-between rounded-xl bg-gray-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-orange-500"
                  >
                    Discover the collection
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className="h-1.5 bg-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace introduction */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start md:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              A simpler way to shop
            </p>

            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
              Your search.
              <span className="block text-gray-400">Your choice.</span>
            </h2>
          </div>

          <div>
            <p className="max-w-2xl text-base leading-8 text-gray-600">
              Great shopping starts with choice. Our marketplace brings products
              from different sellers together, making it easier to explore
              what's available and decide what works for you.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 border-b border-orange-500 pb-1 text-sm font-semibold text-orange-600 transition hover:border-orange-700 hover:text-orange-700"
            >
              Browse all products
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gray-900">
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                  Ready when you are
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Your next great find starts here.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-gray-400">
                  Take a look around, explore the available products, and find
                  something that belongs in your everyday life.
                </p>
              </div>

              <Link
                to="/products"
                className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 md:self-center"
              >
                Explore products
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}