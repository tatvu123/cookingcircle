"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  Share2,
  Bookmark,
  Clock,
  ChefHat,
  ShoppingCart,
  MessageCircle,
  Plus,
  Minus,
  BadgeCheck,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import RecipeCard from "@/components/recipe-card"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/recipe/ProductCard"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRecipe } from "@/hooks/use-recipe"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Head from 'next/head'
import { useProductsByRecipe } from "@/hooks/use-products"
import { useSimilarRecipes } from "@/hooks/use-similar-recipes"

class Fraction {
  constructor(decimal: number) {
    const tolerance = 1.0e-6
    let h1 = 1
    let h2 = 0
    let k1 = 0
    let k2 = 1
    let b = decimal
    do {
      const a = Math.floor(b)
      let aux = h1
      h1 = a * h1 + h2
      h2 = aux
      aux = k1
      k1 = a * k1 + k2
      k2 = aux
      b = 1 / (b - a)
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance)

    this.numerator = h1
    this.denominator = k1
  }

  numerator: number
  denominator: number
}

// 添加這個函數來檢查URL是否是有效的圖片URL（非佔位圖）
const isValidImageUrl = (url?: string | null) => {
  if (!url) return false;
  // 如果URL包含 placeholder.svg 則視為無效
  if (url.includes('placeholder.svg')) return false;
  return true;
};

// 簡化的 RecipeImageGallery 組件（臨時作為占位符）
const RecipeImageGallery = ({ recipeId, mainImageUrl, onMainImageChange }: {
  recipeId: string;
  mainImageUrl?: string;
  onMainImageChange?: (url: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">食譜圖片庫</h3>
      <p className="text-sm text-muted-foreground">
        請先創建 <code>components/recipe/RecipeImageGallery.tsx</code> 組件
      </p>
    </div>
  );
};

export default function RecipeDetail({ params }: { params: { id: string } }) {
  const [servings, setServings] = useState(4)
  const { recipe, ingredients, instructions, comments, loading, error } = useRecipe(params.id)
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null)
  const { products, loading: productsLoading } = useProductsByRecipe(params.id)
  const { similarRecipes, loading: recipesLoading } = useSimilarRecipes(params.id)

  // 當食譜數據加載後，初始化主圖片URL
  useEffect(() => {
    if (recipe?.image_url) {
      setMainImageUrl(recipe.image_url)
    }
  }, [recipe])

  // 主圖片變更處理
  const handleMainImageChange = (url: string) => {
    setMainImageUrl(url)
  }

  // 如果數據正在加載中
  if (loading) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="mb-6">
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <Skeleton className="aspect-video w-full rounded-lg mb-8" />
          {/* 更多加載骨架屏 */}
        </main>
        <Footer />
      </>
    );
  }

  // 如果發生錯誤或找不到食譜
  if (error || !recipe) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertDescription>
              {error || "找不到食譜"}
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </>
    );
  }

  const calculateAmount = (baseAmount: string, originalServings = recipe.servings) => {
    if (!baseAmount) return baseAmount

    // Handle fractions
    let baseNumeric: number
    if (baseAmount.includes("/")) {
      const [num, denom] = baseAmount.split("/")
      baseNumeric = Number(num) / Number(denom)
    } else {
      baseNumeric = Number(baseAmount)
    }

    // Calculate new amount
    const newAmount = (baseNumeric * servings) / originalServings

    // Format the result
    let formattedAmount: string
    if (newAmount < 1 && newAmount > 0) {
      // Convert to fraction if less than 1
      const fraction = new Fraction(newAmount)
      formattedAmount = `${fraction.numerator}/${fraction.denominator}`
    } else {
      formattedAmount = newAmount.toFixed(newAmount % 1 === 0 ? 0 : 2)
    }

    return formattedAmount
  }

  // 使用這個函數確定顯示哪個圖片URL
  const getDisplayImageUrl = (): string => {
    // 如果有有效的 mainImageUrl，使用它
    if (isValidImageUrl(mainImageUrl)) return mainImageUrl as string;
    // 如果有有效的 recipe?.image_url，使用它
    if (isValidImageUrl(recipe?.image_url)) return recipe.image_url;
    // 都沒有則使用佔位圖
    return "/placeholder.svg?height=600&width=1200";
  };

  return (
    <>
      <Navigation />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-muted-foreground mb-4">
                {recipe.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.tags && recipe.tags.length > 0 ? (
                  // 如果有標籤數據，顯示它們
                  recipe.tags.map((tag, index) => (
                    <Badge key={index}>{tag}</Badge>
                  ))
                ) : (
                  // 如果沒有標籤，顯示烹飪時間
                  <Badge variant="outline">{recipe.cooking_time} min</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mb-6">
                <Link href={`/profile/${recipe.user_id}`} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={recipe.users?.profile_image || "/placeholder.svg"} 
                      alt={recipe.users?.username || "chef"} 
                    />
                    <AvatarFallback>{recipe.users?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{recipe.users?.username || "anonymous"}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-0.5">
                            <BadgeCheck className="h-4 w-4 text-blue-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified Chef</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span
                      className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                      title="Follow Chef Mario"
                    >
                      • Follow
                    </span>
                  </div>
                </Link>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Heart className="h-4 w-4" />
                  <span>128</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" />
                  <span>1.2k</span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
              <Image
                src={getDisplayImageUrl()}
                alt={recipe?.title || "食譜圖片"}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Prep Time</p>
                    <p className="text-sm text-muted-foreground">15 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cook Time</p>
                    <p className="text-sm text-muted-foreground">15 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Difficulty</p>
                    <p className="text-sm text-muted-foreground">Medium</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Servings:</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  disabled={servings <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium">{servings}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setServings(servings + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="ingredients" className="mb-10">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients" className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Ingredients</h2>
                  <Button>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add All to Shopping List
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-50 p-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span className="w-48 font-semibold text-sm">Ingredient</span>
                        <span className="w-16 text-center font-semibold text-sm">Amount</span>
                        <span className="w-24 font-semibold text-sm">Unit</span>
                        <span className="font-semibold text-sm">Notes</span>
                      </div>
                      <span className="w-12"></span> {/* Space for shopping cart button */}
                    </div>
                  </div>

                  {/* Ingredients List */}
                  <ul className="divide-y">
                    {ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-6">
                          <span className="w-48 font-medium">{ingredient.name}</span>
                          <span className="w-16 text-center">{calculateAmount(ingredient.quantity)}</span>
                          <span className="w-24">{ingredient.unit}</span>
                          {ingredient.notes && (
                            <span className="text-gray-500 text-sm">
                              {ingredient.notes}
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="bg-gray-50 p-3 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Total Ingredients: {ingredients.length}</span>
                      <span>All measurements are Canadian Standard</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="instructions" className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <ol className="space-y-6">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium mr-3">
                        {instruction.step_number}
                      </span>
                      <p>{instruction.description}</p>
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>

            {/* Comments Section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
                <Button showCommentDialog>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              </div>
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <div key={index} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={comment.user?.profile_image || "/placeholder.svg"} alt={comment.user?.username || "用戶"} />
                      <AvatarFallback>{(comment.user?.username || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{comment.user?.username || "Anonymous"}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-1 md:pt-[200px]">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Nutrition Facts</h3>
                <div className="space-y-2">
                  <div className="flex py-1 border-b">
                    <span className="flex-1">Calories</span>
                    <span className="w-12 text-right font-medium">320</span>
                    <span className="w-8 text-right text-gray-500 ml-2">kcal</span>
                  </div>
                  <div className="flex py-1 border-b">
                    <span className="flex-1">Protein</span>
                    <span className="w-12 text-right font-medium">12</span>
                    <span className="w-8 text-right text-gray-500 ml-2">g</span>
                  </div>
                  <div className="flex py-1 border-b">
                    <span className="flex-1">Carbohydrates</span>
                    <span className="w-12 text-right font-medium">42</span>
                    <span className="w-8 text-right text-gray-500 ml-2">g</span>
                  </div>
                  <div className="flex py-1 border-b">
                    <span className="flex-1">Fat</span>
                    <span className="w-12 text-right font-medium">10</span>
                    <span className="w-8 text-right text-gray-500 ml-2">g</span>
                  </div>
                  <div className="flex py-1">
                    <span className="flex-1">Fiber</span>
                    <span className="w-12 text-right font-medium">2</span>
                    <span className="w-8 text-right text-gray-500 ml-2">g</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
                <div className="space-y-4">
                  {productsLoading ? (
                    // 產品載入中的狀態
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-24 w-full rounded-md" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))
                  ) : products.length > 0 ? (
                    // 顯示從資料庫獲取的產品
                    products.map((product) => (
                      <ProductCard
                        key={product.product_id}
                        image={product.image_url || "/placeholder.svg?height=200&width=200"}
                        name={product.name}
                        description={product.description}
                        rating={product.rating || 4.0}
                        purchases={product.purchases || 0}
                        price={`$${product.price.toFixed(2)}`}
                        onAddToCart={() => console.log(`Added ${product.name} to cart`)}
                      />
                    ))
                  ) : (
                    // 沒有產品時顯示的信息
                    <p className="text-center text-muted-foreground py-4">
                      No related products found.
                    </p>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Products
                </Button>
              </CardContent>
            </Card>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Similar Recipes</h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {recipesLoading ? (
                  // 食譜載入中的狀態
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-video w-full rounded-md" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))
                ) : similarRecipes.length > 0 ? (
                  // 顯示從資料庫獲取的類似食譜
                  similarRecipes.map((similarRecipe) => (
                    <RecipeCard
                      key={similarRecipe.recipe_id}
                      id={similarRecipe.recipe_id}
                      title={similarRecipe.title}
                      image={similarRecipe.image_url || "/placeholder.svg?height=200&width=300"}
                      description={similarRecipe.description}
                      tags={similarRecipe.tags || []}
                      likes={87} // 暫時使用假數據
                      views={756} // 暫時使用假數據
                    />
                  ))
                ) : (
                  // 沒有相似食譜時顯示的信息
                  <p className="text-center text-muted-foreground py-4">
                    No similar recipes found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

