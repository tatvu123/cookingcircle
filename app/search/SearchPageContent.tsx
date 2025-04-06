'use client'

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { supabase } from "@/lib/supabaseClient"
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
  ingredients?: { name: string }[]
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

export default function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("query") || ""
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState(query)

  useEffect(() => {
    async function fetchRecipes() {
      const queryKeywords = query.toLowerCase().split(/[\,\s]+/).map((q) => q.trim())

      const { data, error } = await supabase
        .from("recipes")
        .select(`
          recipe_id,
          title,
          description,
          image_url,
          tags,
          likes_count,
          views_count,
          ingredients:ingredients(name)
        `)
        .order("likes_count", { ascending: false })

      if (error) {
        console.error("Error fetching recipes:", error.message)
        return
      }

      const results = data
        .map((recipe: Recipe) => {
          const ingredientNames = (recipe.ingredients || []).map((ing) => ing.name.toLowerCase())
          const matchCount = queryKeywords.filter((q) =>
            recipe.title.toLowerCase().includes(q) ||
            (recipe.tags || []).some((tag) => tag.toLowerCase().includes(q)) ||
            ingredientNames.some((ing) => ing.includes(q))
          ).length

          return { recipe, matchCount }
        })
        .filter(({ matchCount }) => matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .map(({ recipe }) => recipe)

      setFilteredRecipes(results)
    }

    if (query.trim()) {
      fetchRecipes()
    } else {
      setFilteredRecipes([])
    }
  }, [query])

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
    <main className="min-h-screen flex flex-col">
      <Navigation />

      {/* 검색바 섹션 with Background */}
      <div
        className="w-full relative bg-cover bg-center bg-no-repeat py-10 md:py-16 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80')`,
        }}
      >
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Search Recipes</h2>
          <p className="text-sm md:text-base text-gray-200 mb-6">Find recipes by title, tags, or ingredients</p>

          {/* Search Bar */}
          <div className="relative w-full mb-4">
            <Input
              type="search"
              placeholder="Search recipes..."
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
          <div className="flex flex-wrap justify-center gap-2 mt-4 mb-2">
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

          {/* Dietary Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="w-full text-center text-sm text-gray-300 mb-1">Dietary Restrictions:</span>
            {allergenKeywords.map((keyword, idx) => (
              <button
                key={idx}
                onClick={() => handleKeywordClick(keyword)}
                className="text-xs font-medium bg-green-500/40 text-white px-3 py-1 rounded-full border border-green-400/30 hover:bg-green-500/50 transition"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="flex-grow p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Search Results for: "{query}"</h1>
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.recipe_id}
                id={recipe.recipe_id}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image_url}
                tags={recipe.tags}
                likes={recipe.likes_count}
                views={recipe.views_count}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500">No recipes found.</p>
        )}
      </div>

      <Footer />
    </main>
  )
}
