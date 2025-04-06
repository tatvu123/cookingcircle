"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { ProductCard } from "@/components/recipe/ProductCard"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
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

export default function KitchenwarePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchKitchenware() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .limit(50)

      if (!error && data) {
        setProducts(data)
      } else {
        console.error("Failed to fetch kitchenware:", error)
      }
    }

    fetchKitchenware()
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search query!")
      return
    }
    router.push(`/search/products?query=${encodeURIComponent(searchQuery)}`)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    router.push(`/search/products?query=${encodeURIComponent(keyword)}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Search Section */}
      <div
        className="w-full relative bg-cover bg-center bg-no-repeat py-10 md:py-16 text-white"
        style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1512058564366-18510be2db19')`,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Kitchenware</h2>
          <p className="text-sm md:text-base text-gray-200 mb-6">
            Find the best tools for your kitchen adventures
          </p>

          {/* Search Bar */}
          <div className="relative w-full mb-4">
            <Input
              type="search"
              placeholder="Search kitchenware..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              className="w-full pl-12 py-2 md:py-3 pr-4 text-sm md:text-base rounded-md border-gray-200 bg-white focus:border-gray-300 focus:ring-0 text-black"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm rounded bg-black text-white"
            >
              Find
            </button>
          </div>

          {/* Quick Keywords */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {hotSearchKeywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => handleKeywordClick(keyword)}
                className="text-xs font-medium text-white bg-black/30 px-3 py-1 rounded-full border border-white/20 hover:bg-black/50"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-grow max-w-[1200px] mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-6">All Kitchenware</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <ProductCard
              key={item.product_id}
              name={item.name}
              image={item.image_url || "/Kitchenware_Image/default.jpg"}
              description={item.description}
              rating={item.rating}
              purchases={item.purchases}
              price={`$${item.price}`}
              onAddToCart={() => console.log("Added to cart:", item.name)}
            />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
