"use client"

import { supabase } from "@/lib/supabaseClient"
import { useState, useEffect, useRef } from "react"
import { ProductCard } from "@/components/recipe/ProductCard"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { Search, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Footer } from "@/components/layout/Footer"
import { NewRecipeButton } from "@/components/new-recipe-button"
import { Button } from "@/components/ui/button"
import { LogIn, Bell } from "lucide-react"

// navigation bar
import { Navigation} from "@/components/layout/Navigation"


// Router
import { useRouter } from "next/navigation"

const filterCategories = [
  "All",
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
  "Vegan",
  "Lactose-Free",
  "Gluten-Free",
]

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

interface Recipe {
  recipe_id: string
  title: string
  description: string
  image_url: string
  tags: string[]
  likes_count: number
  views_count: number
}
interface Ingredient {
  id: string
  name: string
  ingredient_image_url?: string
  ingredient_description?: string
}

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

interface FilterPillProps {
  label: string
  active: boolean
  onClick: () => void
}

export function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm transition-colors whitespace-nowrap ${
        active ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  )
}

interface SearchBarProps {
  placeholder: string
  onSearch: (query: string) => void
}

export function SearchBar({ placeholder }: { placeholder: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // search part
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search query!");
      return;
    }
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`); 
  };

  return (
    <div className="relative w-full">
      {/* search input */}
      <Input
        type="search"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        className="w-full pl-12 py-2 md:py-3 pr-4 text-sm md:text-base rounded-md border-gray-200 bg-white focus:border-gray-300 focus:ring-0"
      />

      {/* search icon */}
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />

      {/* search button */}
      <button
        onClick={handleSearch}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-black text-white rounded-md text-sm"
      >
        Find
      </button>
    </div>
  );
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]) 
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([])
  const [recommendedIngredients, setRecommendedIngredients] = useState<Ingredient[]>([])
  const [kitchenware, setKitchenware] = useState<Product[]>([])
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    async function fetchRecipes() {
      const { data, error } = await supabase.from("recipes")
      .select("*")
      .order("likes_count", { ascending: false })
      .limit(4)

      if (error) {
        console.error("Supabase fetch error:", error)
      } else {
        console.log(" Supabase fetch success! Data:", data)
        setRecipes(data)
      }
    }

    async function fetchTrending() {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("views_count", { ascending: false })
        .limit(4)

      if (!error && data) {
        setTrendingRecipes(data)
      }
    }

    async function fetchIngredients() {
      const { data, error } = await supabase
        .from("ingredients")
        .select("ingredient_id, name, ingredient_image_url, ingredient_description")
        .limit(50)
    
      if (!error && data) {
        const transformed = data.map((item) => ({
          id: item.ingredient_id,
          name: item.name,
          ingredient_image_url: item.ingredient_image_url,
          ingredient_description: item.ingredient_description,
        }))
        const shuffled = transformed.sort(() => 0.5 - Math.random())
        setRecommendedIngredients(shuffled.slice(0, 4))
      }
    }
    
    async function fetchKitchenware() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .limit(50)
    
      if (!error && data) {
        const shuffled = data.sort(() => 0.5 - Math.random())
        setKitchenware(shuffled.slice(0, 4))
      } else {
        console.error("Failed to fetch kitchenware:", error)
      }
    }
    
    fetchRecipes()
    fetchTrending()
    fetchIngredients()
    fetchKitchenware()
  }, [])
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter)
  }

  const router = useRouter(); 

const handleSearch = (query: string) => {
  if (query.trim() === "") { 
    alert("Please insert text!"); 
    return; 
  }
  router.push(`/search?query=${encodeURIComponent(query)}`);
};

  const handleViewAll = (section: string) => {
    console.log(`View all clicked for ${section}`)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    handleSearch(keyword)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navigation />

      {/* Search Bar Section */}
      <div
        className="w-full relative bg-cover bg-center bg-no-repeat py-8 md:py-16"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images-PHf2Vh4iBeQkDwgv1ZmWwfJQgGnpne.jpeg')`,
          backgroundPosition: "50% 45%",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col items-center relative z-10">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-center mb-3 text-white">
            Find your next culinary adventure
          </h2>
          <p className="text-sm md:text-base text-gray-200 text-center mb-6 md:mb-8 px-4">
            Type an ingredient or recipe name to find relevant recipes
          </p>
          <div className="w-full max-w-2xl">
            
            {/*<SearchBar placeholder="Search recipes..." onSearch={handleSearch} />*/}
            <SearchBar placeholder="Search recipes..." />
            
            <div className="flex flex-col gap-3 mt-3">
              {/* Hot Search Keywords */}
              <div className="flex flex-wrap gap-1.5 justify-center px-2">
                {hotSearchKeywords.map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => handleKeywordClick(keyword)}
                    className="text-xs font-medium text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20 hover:bg-black/40 transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>

              {/* Allergens Filter */}
              <div className="flex flex-wrap gap-1.5 justify-center px-2">
                <span className="w-full text-center text-white text-sm mb-1">Dietary Restrictions:</span>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-8">
        {/* Filter pills */}
        <div className="flex gap-2 mb-6 md:mb-10 flex-wrap">
          <div className="w-full flex justify-between items-center mb-2">
            <div className="font-medium text-sm md:text-base">Categories & Dietary Restrictions</div>
            <Button variant="ghost" size="sm" onClick={() => setActiveFilter("All")} className="text-sm">
              Clear Filters
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap max-h-[120px] md:max-h-none overflow-y-auto pb-2">
            {filterCategories.map((filter) => (
              <FilterPill
                key={filter}
                label={filter}
                active={activeFilter === filter}
                onClick={() => handleFilterClick(filter)}
              />
            ))}
          </div>
        </div>

        {/* Recipe sections */}
        <div className="space-y-8 md:space-y-16">
          <section>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Popular Recipes</h2>
              <a href="/view_all/popRecipes" className="text-sm font-medium text-black hover:underline">
                View all
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Trending Now</h2>
              <a href="/view_all/trendRecipes" className="text-sm font-medium text-black hover:underline">
                View all
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingRecipes.map((recipe) => (
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
          </section>

          {/* You May Want to Buy Section */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-8">You may be interested in...</h2>

            {/* Ingredients Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold tracking-tight">Ingredients</h3>
                <a href="/view_all/ingredients" className="text-sm font-medium text-black hover:underline">
                  View all
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedIngredients.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    image={product.ingredient_image_url || "/Ingredients_Image/default.jpg"}
                    description={product.ingredient_description || "Handpicked high-quality ingredient"}
                    rating={4.8}
                    purchases={Math.floor(Math.random() * 1000) + 100}
                    price="$9.99"
                    onAddToCart={() => console.log("Added to cart:", product.name)}
                  />
                ))}
                </div>
              </div>

            {/* Kitchenware Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold tracking-tight">Kitchenware</h3>
                <a href="/view_all/kitchenware" className="text-sm font-medium text-black hover:underline">
                  View all
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {kitchenware.map((item) => (
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
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}

