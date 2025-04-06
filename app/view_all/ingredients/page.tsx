// app/View_all/ingredients/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { ProductCard } from "@/components/recipe/ProductCard"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Ingredient {
  id: string
  name: string
  ingredient_image_url?: string
  ingredient_description?: string
}

const hotSearchKeywords = [
  "Tomato",
  "Chicken",
  "Garlic",
  "Egg",
  "Spinach",
  "Onion",
  "Beef",
  "Salmon",
]

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchIngredients() {
      const { data, error } = await supabase
        .from("ingredients")
        .select("ingredient_id, name, ingredient_image_url, ingredient_description")
        .limit(100)

      if (!error && data) {
        const transformed = data.map((item) => ({
          id: item.ingredient_id,
          name: item.name,
          ingredient_image_url: item.ingredient_image_url,
          ingredient_description: item.ingredient_description,
        }))
        setIngredients(transformed)
      } else {
        console.error("Failed to fetch ingredients:", error)
      }
    }

    fetchIngredients()
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search query!")
      return
    }
    router.push(`/search/ingredients?query=${encodeURIComponent(searchQuery)}`)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    router.push(`/search/ingredients?query=${encodeURIComponent(keyword)}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <div
        className="w-full relative bg-cover bg-center bg-no-repeat py-10 md:py-16 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1512058564366-18510be2db19')`,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Explore Ingredients</h2>
          <p className="text-sm md:text-base text-gray-200 mb-6">
            Search and explore essential ingredients for your recipes
          </p>

          <div className="relative w-full mb-4">
            <Input
              type="search"
              placeholder="Search ingredients..."
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

      <div className="flex-grow max-w-[1200px] mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-6">All Ingredients</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ingredients.map((item) => (
            <ProductCard
              key={item.id}
              name={item.name}
              image={item.ingredient_image_url || "/Ingredients_Image/default.jpg"}
              description={item.ingredient_description || "Essential cooking ingredient"}
              rating={4.8}
              purchases={Math.floor(Math.random() * 800 + 100)}
              price="$4.99"
              onAddToCart={() => console.log("Add to cart:", item.name)}
            />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
