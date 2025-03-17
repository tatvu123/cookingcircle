"use client"

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

const popularRecipes = [
  {
    id: "f0460d2f-fa26-474a-9cac-90deda8d411a",
    title: "Homemade Margherita Pizza",
    image: "/placeholder.svg?height=300&width=400",
    description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
    tags: ["Italian", "Vegetarian"],
    likes: 128,
    views: 1024,
  },
  {
    id: "2",
    title: "Avocado Toast with Poached Eggs",
    image: "/placeholder.svg?height=300&width=400",
    description: "Creamy avocado on toasted bread topped with perfectly poached eggs",
    tags: ["Breakfast", "Healthy"],
    likes: 95,
    views: 876,
  },
  {
    id: "3",
    title: "Thai Green Curry",
    image: "/placeholder.svg?height=300&width=400",
    description: "Aromatic and spicy Thai curry with vegetables and coconut milk",
    tags: ["Thai", "Spicy"],
    likes: 156,
    views: 1432,
  },
  {
    id: "4",
    title: "Chocolate Chip Cookies",
    image: "/placeholder.svg?height=300&width=400",
    description: "Classic homemade cookies with gooey chocolate chips",
    tags: ["Dessert", "Baking"],
    likes: 210,
    views: 1876,
  },
]

const trendingRecipes = [
  {
    id: "5",
    title: "Korean Bibimbap",
    image: "/placeholder.svg?height=300&width=400",
    description: "Colorful rice bowl with vegetables, meat, and spicy gochujang sauce",
    tags: ["Korean", "Spicy"],
    likes: 178,
    views: 1532,
  },
  {
    id: "6",
    title: "Vegan Mushroom Risotto",
    image: "/placeholder.svg?height=300&width=400",
    description: "Creamy Italian rice dish with mushrooms and herbs",
    tags: ["Italian", "Vegan"],
    likes: 87,
    views: 943,
  },
  {
    id: "7",
    title: "Beef Wellington",
    image: "/placeholder.svg?height=300&width=400",
    description: "Tender beef fillet wrapped in puff pastry with mushroom duxelles",
    tags: ["British", "Special Occasion"],
    likes: 132,
    views: 1245,
  },
  {
    id: "8",
    title: "Lemon Blueberry Pancakes",
    image: "/placeholder.svg?height=300&width=400",
    description: "Fluffy pancakes with fresh blueberries and lemon zest",
    tags: ["Breakfast", "Sweet"],
    likes: 104,
    views: 987,
  },
]

const recommendedIngredients = [
  {
    id: "i1",
    name: "Premium Italian Extra Virgin Olive Oil",
    image: "/placeholder.svg?height=400&width=400",
    description: "Cold-pressed, single-origin olive oil from Tuscany. Perfect for cooking and finishing dishes.",
    rating: 4.8,
    purchases: 1234,
    price: "$24.99",
  },
  {
    id: "i2",
    name: "Himalayan Pink Salt",
    image: "/placeholder.svg?height=400&width=400",
    description: "Pure, unrefined mineral salt with natural pink color. Enhances flavor in all dishes.",
    rating: 4.7,
    purchases: 2156,
    price: "$8.99",
  },
  {
    id: "i3",
    name: "Aged Balsamic Vinegar",
    image: "/placeholder.svg?height=400&width=400",
    description: "12-year aged balsamic from Modena, Italy. Rich, complex flavor perfect for dressing and marinades.",
    rating: 4.9,
    purchases: 876,
    price: "$29.99",
  },
  {
    id: "i4",
    name: "Organic Saffron Threads",
    image: "/placeholder.svg?height=400&width=400",
    description: "Premium grade Spanish saffron. Adds authentic color and aroma to paella and risotto.",
    rating: 4.8,
    purchases: 543,
    price: "$18.99",
  },
]

const recommendedKitchenware = [
  {
    id: "k1",
    name: "Professional Chef's Knife",
    image: "/placeholder.svg?height=400&width=400",
    description: "8-inch high-carbon stainless steel blade. Perfect balance and precision cutting.",
    rating: 4.9,
    purchases: 3421,
    price: "$129.99",
  },
  {
    id: "k2",
    name: "Cast Iron Skillet",
    image: "/placeholder.svg?height=400&width=400",
    description: "Pre-seasoned 12-inch skillet. Superior heat retention and versatility.",
    rating: 4.8,
    purchases: 5632,
    price: "$49.99",
  },
  {
    id: "k3",
    name: "Stand Mixer",
    image: "/placeholder.svg?height=400&width=400",
    description: "Professional-grade 5-quart mixer. 10 speeds with multiple attachments included.",
    rating: 4.9,
    purchases: 2187,
    price: "$299.99",
  },
  {
    id: "k4",
    name: "Digital Kitchen Scale",
    image: "/placeholder.svg?height=400&width=400",
    description: "Precise measurements in grams and ounces. Essential for baking and portion control.",
    rating: 4.7,
    purchases: 1876,
    price: "$24.99",
  },
]

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

export function SearchBar({ placeholder, onSearch }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Input
        type="search"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-12 py-2 md:py-3 pr-4 text-sm md:text-base rounded-md border-gray-200 bg-white focus:border-gray-300 focus:ring-0"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
    </div>
  )
}

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="w-full bg-white border-b border-zinc-200 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-semibold tracking-tight">Cooking Circle</h1>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-sm font-medium hover:text-zinc-600 transition-colors">
              Explore
            </a>
            <a href="/profile/poster" className="text-sm font-medium hover:text-zinc-600 transition-colors">
              My Recipes
            </a>
            <a href="#" className="text-sm font-medium hover:text-zinc-600 transition-colors">
              Favorites
            </a>
            <a href="/shopping-list" className="text-sm font-medium hover:text-zinc-600 transition-colors">
              Shop
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <NewRecipeButton />
          <Button variant="default" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
          <Button variant="ghost" size="icon" className="relative" href="/shopping-list">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </Button>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors md:hidden"
                  aria-label="Menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 18L20 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 12L20 12" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 6L20 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-xs">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Explore more options.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <a href="/profile/poster" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 block">
                    My Recipes
                  </a>
                  <a href="#" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 block">
                    Favorites
                  </a>
                  <a href="/shopping-list" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 block">
                    Shop
                  </a>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                      Close
                    </button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <div className="relative hidden md:block">
              <button
                className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="Menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 18L20 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 12L20 12" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 6L20 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                  <a href="/profile/poster" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Recipes
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Favorites
                  </a>
                  <a href="/shopping-list" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Shop
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

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
            <SearchBar placeholder="Search recipes..." onSearch={handleSearch} />
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
              <a href="#" className="text-sm font-medium text-black hover:underline">
                View all
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {popularRecipes.map((recipe) => {
                if (recipe.title === "Homemade Margherita Pizza") {
                  return <RecipeCard key={`recipe-${recipe.id}`} {...recipe} id="f0460d2f-fa26-474a-9cac-90deda8d411a" />
                }
                return <RecipeCard key={`recipe-${recipe.id}`} {...recipe} />
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Trending Now</h2>
              <a href="#" className="text-sm font-medium text-black hover:underline">
                View all
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} {...recipe} />
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
                <a href="#" className="text-sm font-medium text-black hover:underline">
                  View all
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedIngredients.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onAddToCart={() => {
                      console.log("Adding to cart:", product.name)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Kitchenware Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold tracking-tight">Kitchenware</h3>
                <a href="#" className="text-sm font-medium text-black hover:underline">
                  View all
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendedKitchenware.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onAddToCart={() => {
                      console.log("Adding to cart:", product.name)
                    }}
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

