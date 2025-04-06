"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/recipe/ProductCard"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Product {
  product_id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  rating: number
  purchases: number
  in_stock: boolean
}

const hotSearchKeywords = [
  "Pan",
  "Knife",
  "Cutting Board",
  "Blender",
  "Air Fryer",
  "Measuring Cups",
  "Microwave",
  "Pot",
]

export default function ProductSearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("query") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<Product[]>([])

  useEffect(() => {
    async function fetchProducts() {
      if (!query.trim()) {
        setResults([])
        return
      }

      const { data, error } = await supabase.from("products").select("*")

      if (error) {
        console.error("Failed to fetch products:", error)
        return
      }

      const lowerQuery = query.toLowerCase()

      const filtered = data.filter((product: Product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
      )

      setResults(filtered)
    }

    fetchProducts()
  }, [query])

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search term!")
      return
    }
    router.push(`/search/products?query=${encodeURIComponent(searchQuery)}`)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    router.push(`/search/products?query=${encodeURIComponent(keyword)}`)
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      {/* Search Section */}
      <div
  className="w-full relative bg-cover bg-center bg-no-repeat py-10 md:py-16 text-white min-h-[400px]"
  style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1512058564366-18510be2db19')",
  }}
>

        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Search Kitchenware</h2>
          <p className="text-sm md:text-base text-gray-200 mb-6">Find the best tools for your kitchen</p>

          {/* Search Bar */}
          <div className="relative w-full mb-4">
            <Input
              type="search"
              placeholder="Search kitchenware..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-12 pr-4 py-2 text-black rounded-md border-gray-200 focus:border-gray-300 focus:ring-0"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-1 rounded text-sm"
            >
              Find
            </button>
          </div>

          {/* Hot Search Keywords */}
          <div className="flex flex-wrap justify-center gap-2">
            {hotSearchKeywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => handleKeywordClick(keyword)}
                className="text-xs font-medium bg-white/20 text-white px-3 py-1 rounded-full border border-white/10 hover:bg-white/30 transition"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Results */}
      <div className="flex-grow max-w-[1200px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Search Results for: "{query}"</h1>
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((item) => (
              <ProductCard
                key={item.product_id}
                name={item.name}
                image={item.image_url || "/Kitchenware_Image/default.jpg"}
                description={item.description}
                rating={item.rating}
                purchases={item.purchases}
                price={`$${item.price}`}
                onAddToCart={() => console.log("Add to cart:", item.name)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-6">No products found.</p>
        )}
      </div>

      <Footer />
    </main>
  )
}
