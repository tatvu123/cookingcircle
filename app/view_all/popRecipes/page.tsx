"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Recipe {
  recipe_id: string
  title: string
  description: string
  image_url: string
  tags: string[]
  likes_count: number
  views_count: number
}

const hotSearchKeywords = [
  "Pasta Carbonara",
  "Easy Breakfast",
  "Quick Dinner",
  "Vegetarian",
  "Baking",
  "Healthy Salads",
  "Keto",
  "Chicken Recipes",
  "15-Minute Meals",
  "Desserts",
]

const allergenKeywords = ["Vegan", "Lactose-Free", "Gluten-Free"]

export default function PopRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchPopularRecipes() {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("likes_count", { ascending: false })
        .limit(20)

      if (!error && data) {
        setRecipes(data)
      } else {
        console.error("Failed to fetch popular recipes:", error)
      }
    }

    fetchPopularRecipes()
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search query!")
      return
    }
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    router.push(`/search?query=${encodeURIComponent(keyword)}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Search Section with Background */}
      <div
        className="w-full relative bg-cover bg-center bg-no-repeat py-10 md:py-16 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-PHf2Vh4iBeQkDwgv1ZmWwfJQgGnpne.jpeg')`,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Popular Recipes</h2>
          <p className="text-sm md:text-base text-gray-200 mb-6">
            Search through the most liked recipes
          </p>

          {/* Search Input */}
          <div className="relative w-full mb-4">
            <Input
              type="search"
              placeholder="Search popular recipes..."
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

          {/* 🔥 Hot Keywords */}
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

          {/* ✅ Dietary Filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 px-2">
            <span className="w-full text-center text-white text-sm mb-1">
              Dietary Restrictions:
            </span>
            {allergenKeywords.map((allergen, index) => (
              <button
                key={index}
                onClick={() => handleKeywordClick(allergen)}
                className="text-xs font-medium text-white bg-green-500/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-green-400/30 hover:bg-green-500/50 transition-colors"
              >
                {allergen}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="flex-grow max-w-[1200px] mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-6">All Popular Recipes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipe_id}
              id={recipe.recipe_id}
              title={recipe.title}
              image={recipe.image_url}
              description={recipe.description}
              tags={recipe.tags}
              likes={recipe.likes_count}
              views={recipe.views_count}
            />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
