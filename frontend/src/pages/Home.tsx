import CatalogProductCard from "../components/CatalogProductCard"
import Error from "../components/Error"
import HeroSection from "../components/HeroSection"
import { TrustStrip } from "../components/TrustStrip"
import { useHome } from "../hooks/useHome"

function Home() {

  const {
    categories,
    categoryFilter,
    setCategory,
    categoriesLoading,
    products,
    productsLoading,
    error
  } = useHome()

  return (
    <div className="space-y-10">
      <HeroSection categories={categories} categoriesLoading={categoriesLoading} />

      <TrustStrip />

      <section id="catolag" className="scroll-mt-24">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-2xl font-bold text-base-content md:text-2xl uppercase font-mono">
              Catalog
            </h2>
            <p className="text-sm text-gray-200">
              Filter by cateogory or open a product for full specifications
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn btn-sm ${!categoryFilter ? "btn-primary" : "btn-ghost border border-base-300"}`}
              onClick={() => setCategory("")}>
              All
            </button>
            {categories.length > 0 && categories.map((c, i) => (
              <button
                key={i}
                type="button"
                className={`btn btn-sm ${categoryFilter === c.category ? "btn-primary" : "btn-ghost border border-base-300"}`}
                onClick={() => setCategory(c.category)}>
                {c.category}
              </button>
            ))}
          </div>
        </div>

          {productsLoading ? (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i}>
                <div className="skeleton h-96 w-full rounded-box" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <Error message="We couldn't load products. Please try again in a moment." />
        ) : products.length === 0 ? (
          <div className="rounded-box border border-base-300 bg-base-100 py-16 text-center text-base-content/60">
            No products in this category yet.
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <CatalogProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Home
