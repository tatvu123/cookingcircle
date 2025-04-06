"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { ProductCard } from "@/components/recipe/ProductCard"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Ingredient {
  ingredient_id: string
  name: string
  ingredient_image_url?: string
  ingredient_description?: string
}

const hotSearchKeywords = [
  "Tomato",
  "Garlic",
  "Onion",
  "Spinach",
  "Egg",
  "Salmon",
  "Beef",
  "Chicken",
]

export default function IngredientSearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("query") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  useEffect(() => {
    async function fetchIngredients() {
      if (!query.trim()) {
        setIngredients([])
        return
      }

      const { data, error } = await supabase.from("ingredients").select("*")

      if (!error && data) {
        const filtered = data.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        )
        setIngredients(filtered)
      } else {
        console.error("Error fetching ingredients:", error)
      }
    }

    fetchIngredients()
  }, [query])

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search term!")
      return
    }
    router.push(`/search/ingredients?query=${encodeURIComponent(searchQuery)}`)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    router.push(`/search/ingredients?query=${encodeURIComponent(keyword)}`)
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      {/* Search Section */}
      <div
        className="w-full relative bg-cover bg-center bg-no-repeat py-10 md:py-16 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80')",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Search Ingredients</h2>
          <p className="text-sm md:text-base text-gray-200 mb-6">
            Explore fresh ingredients for your next recipe
          </p>

          {/* Search Bar */}
          <div className="relative w-full mb-4">
            <Input
              type="search"
              placeholder="Search ingredients..."
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

          {/* Hot Keywords */}
          <div className="flex flex-wrap justify-center gap-2">
            {hotSearchKeywords.map((keyword, idx) => (
              <button
                key={idx}
                onClick={() => handleKeywordClick(keyword)}
                className="text-xs font-medium bg-white/20 text-white px-3 py-1 rounded-full border border-white/10 hover:bg-white/30 transition"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-grow max-w-[1200px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">
          Search Results for: "{query}"
        </h1>
        {ingredients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ingredients.map((item) => (
              <ProductCard
                key={item.ingredient_id}
                name={item.name}
                image={item.ingredient_image_url || "/Ingredients_Image/default.jpg"}
                description={item.ingredient_description || "No description"}
                rating={4.7}
                purchases={Math.floor(Math.random() * 500)}
                price="$3.99"
                onAddToCart={() => console.log("Added", item.name)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-6">No ingredients found.</p>
        )}
      </div>

      <Footer />
    </main>
  )
}
