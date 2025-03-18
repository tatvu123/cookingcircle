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
  Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ShareButton } from "@/components/recipe/ShareButton"
import { CollectButton } from "@/components/recipe/CollectButton"
import { LikeButton } from "@/components/recipe/LikeButton"
import { ViewCounter } from "@/components/recipe/ViewCounter"
import { useAuth } from "@/hooks/use-auth"
import { recordRecipeView } from "@/lib/recipe-view-service"
import { FollowButton } from "@/components/user/FollowButton"
import { NutritionFacts } from "@/components/recipe/NutritionFacts"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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

// Function to check if a URL is a valid image URL (not a placeholder)
const isValidImageUrl = (url?: string | null) => {
  if (!url) return false;
  // If URL contains placeholder.svg consider it invalid
  if (url.includes('placeholder.svg')) return false;
  return true;
};

// Simplified RecipeImageGallery component (temporary placeholder)
const RecipeImageGallery = ({ recipeId, mainImageUrl, onMainImageChange }: {
  recipeId: string;
  mainImageUrl?: string;
  onMainImageChange?: (url: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recipe Image Gallery</h3>
      <p className="text-sm text-muted-foreground">
        Please create the <code>components/recipe/RecipeImageGallery.tsx</code> component first
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
  const { user } = useAuth()
  const [commentOpen, setCommentOpen] = useState(false)
  const [commentText, setCommentText] = useState("")

  // When recipe data is loaded, initialize the main image URL
  useEffect(() => {
    if (recipe?.image_url) {
      setMainImageUrl(recipe.image_url)
    }
  }, [recipe])

  // Main image change handler
  const handleMainImageChange = (url: string) => {
    setMainImageUrl(url)
  }

  // Record recipe view
  useEffect(() => {
    const recordView = async () => {
      await recordRecipeView(params.id, user?.id);
    };
    
    recordView();
  }, [params.id, user?.id]);

  // If data is still loading
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
          {/* More loading skeletons */}
        </main>
        <Footer />
      </>
    );
  }

  // If an error occurs or the recipe is not found
  if (error || !recipe) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1200px] mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertDescription>
              {error || "Recipe not found"}
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </>
    );
  }

  const calculateAmount = (baseAmount: string, originalServings = recipe.servings) => {
    if (!baseAmount) return baseAmount

    // 處理混合分數，例如 "2 1/4"
    let baseNumeric: number
    if (baseAmount.includes(" ") && baseAmount.includes("/")) {
      // 混合分數 (例如 "2 1/4")
      const [whole, fraction] = baseAmount.split(" ")
      const [num, denom] = fraction.split("/")
      baseNumeric = Number(whole) + Number(num) / Number(denom)
    } else if (baseAmount.includes("/")) {
      // 簡單分數 (例如 "1/4")
      const [num, denom] = baseAmount.split("/")
      baseNumeric = Number(num) / Number(denom)
    } else {
      // 普通數字
      baseNumeric = Number(baseAmount)
    }

    // 如果轉換結果是NaN，則直接返回原始字符串
    if (isNaN(baseNumeric)) return baseAmount
    
    // 計算新數量
    const newAmount = (baseNumeric * servings) / originalServings

    // 格式化結果
    let formattedAmount: string
    if (newAmount < 1 && newAmount > 0) {
      // 小於1時轉換為分數
      const fraction = new Fraction(newAmount)
      formattedAmount = `${fraction.numerator}/${fraction.denominator}`
    } else if (newAmount % 1 === 0) {
      // 整數
      formattedAmount = newAmount.toFixed(0)
    } else {
      // 混合數，顯示為 "2 1/4" 格式
      const whole = Math.floor(newAmount)
      const remainder = newAmount - whole
      if (remainder > 0) {
        const fraction = new Fraction(remainder)
        formattedAmount = `${whole} ${fraction.numerator}/${fraction.denominator}`
      } else {
        formattedAmount = whole.toString()
      }
    }

    return formattedAmount
  }

  // Use this function to determine which image URL to display
  const getDisplayImageUrl = (): string => {
    // If there's a valid mainImageUrl, use it
    if (isValidImageUrl(mainImageUrl)) return mainImageUrl as string;
    // If there's a valid recipe?.image_url, use it
    if (isValidImageUrl(recipe?.image_url)) return recipe.image_url;
    // Otherwise use a placeholder image
    return "/placeholder.svg?height=600&width=1200";
  };

  // 購物車功能處理
  const handleAddToCart = (ingredient: any) => {
    if (!user) {
      toast({
        title: "Please Log in",
        description: "You need to log in to add items to your shopping cart.",
        variant: "destructive"
      });
      return;
    }
    
    // 這裡之後可以實現真正的添加到購物車功能
    toast({
      title: "Add To Cart Successfully!",
      description: `${ingredient.name} has been added to your shopping cart.`,
    });
  }

  // 產品購物車功能處理
  const handleAddProductToCart = (product: any) => {
    if (!user) {
      toast({
        title: "Please Log in",
        description: "You need to log in to add items to your shopping cart.",
        variant: "destructive"
      });
      return;
    }
    
    // 這裡之後可以實現真正的添加到購物車功能
    toast({
      title: "Add To Cart Successfully!",
      description: `${product.name} has been added to your shopping cart.`,
    });
  }

  // 添加所有食材到購物車
  const handleAddAllToCart = () => {
    if (!user) {
      toast({
        title: "Please Log in",
        description: "You need to log in to add items to your shopping list.",
        variant: "destructive"
      });
      return;
    }
    
    // 這裡實現添加所有食材到購物清單
    toast({
      title: "Add To Cart Successfully!",
      description: "All ingredients have been added to your shopping list.",
    });
  }

  // 處理評論提交
  const handleCommentSubmit = () => {
    if (!commentText.trim()) {
      toast({
        title: "Cannot Submit Empty Comment",
        description: "Please enter some text for your comment.",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: 實際發送評論到後端
    // 這裡之後可以實現實際的評論提交功能
    
    toast({
      title: "Comment Posted Successfully!",
      description: "Your comment has been published.",
    });
    
    // 清空評論內容並關閉對話框
    setCommentText("");
    setCommentOpen(false);
  }

  // 處理食譜收藏功能
  const handleCollectRecipe = (recipeId: string, title: string) => {
    if (!user) {
      toast({
        title: "Please Log in",
        description: "You need to log in to collect recipes.",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: 實際實現收藏功能到後端
    toast({
      title: "Recipe Collected!",
      description: `${title} has been added to your collection.`,
    });
  }

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
                  // If there are tag data, display them
                  recipe.tags.map((tag, index) => (
                    <Badge key={index}>{tag}</Badge>
                  ))
                ) : (
                  // If there are no tags, display cooking time
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
                  </div>
                </Link>
                {recipe.user_id !== user?.id && (
                  <FollowButton 
                    userId={user?.id} 
                    profileId={recipe.user_id} 
                    variant="outline"
                    size="sm"
                  />
                )}
                <LikeButton
                  recipeId={params.id}
                  userId={user?.id}
                  initialCount={recipe?.likes_count || 0}
                />
                <ViewCounter
                  recipeId={params.id}
                  initialCount={recipe?.views_count || 0}
                />
                <CollectButton
                  recipeId={params.id}
                  userId={user?.id}
                />
                <ShareButton 
                  title={recipe.title} 
                  description={recipe.description}
                />
              </div>
            </div>

            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
              <Image
                src={getDisplayImageUrl()}
                alt={recipe?.title || "Recipe Image"}
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
                <span className="text-sm font-medium">Adjust recipe for:</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  disabled={servings <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium">{servings} servings</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setServings(servings + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-60">Adjusts ingredient quantities only. Nutrition facts are always shown per single serving.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <Tabs defaultValue="ingredients" className="mb-10">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients" className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Ingredients</h2>
                  <Button onClick={handleAddAllToCart}>
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

                  {/* Ingredient rows */}
                  <div>
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="p-3 border-b last:border-b-0 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <span className="w-48 text-sm">{ingredient.name}</span>
                          <span className="w-16 text-center text-sm">{calculateAmount(ingredient.quantity)}</span>
                          <span className="w-24 text-sm">{ingredient.unit}</span>
                          <span className="text-sm text-muted-foreground">{ingredient.notes}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={() => handleAddToCart(ingredient)}>
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="instructions" className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <div className="space-y-6">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">{instruction.step_number || index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm">{instruction.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="nutrition" className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Nutrition Facts</h2>
                <div className="border rounded-lg p-6 bg-white">
                  <NutritionFacts recipeId={params.id} />
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>* Nutritional information is for reference only and may vary based on ingredients and cooking methods.</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Comments Section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
                <Button onClick={() => {
                  if (!user) {
                    toast({
                      title: "Please Log in",
                      description: "You need to log in before commenting.",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  // 如果用戶已登入，打開評論對話框
                  setCommentOpen(true);
                }}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              </div>
              
              {/* 評論對話框 */}
              <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Post a Comment</DialogTitle>
                    <DialogDescription>
                      Share your thoughts and opinions about this recipe.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write your comment..."
                    className="min-h-[120px]"
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCommentOpen(false)}>Cancel</Button>
                    <Button onClick={handleCommentSubmit}>Post Comment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <div key={index} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={comment.user?.profile_image || "/placeholder.svg"} alt={comment.user?.username || "User"} />
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

          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
                <div className="space-y-4">
                  {productsLoading ? (
                    // Product loading state
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-24 w-full rounded-md" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))
                  ) : products.length > 0 ? (
                    // Display products retrieved from database
                    products.map((product) => (
                      <ProductCard
                        key={product.product_id}
                        image={product.image_url || "/placeholder.svg?height=200&width=200"}
                        name={product.name}
                        description={product.description}
                        rating={product.rating || 4.0}
                        purchases={product.purchases || 0}
                        price={`$${product.price.toFixed(2)}`}
                        onAddToCart={() => handleAddProductToCart(product)}
                      />
                    ))
                  ) : (
                    // Information to display when there are no products
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
                  // Recipe loading state
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-video w-full rounded-md" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))
                ) : similarRecipes.length > 0 ? (
                  // Display similar recipes retrieved from database
                  similarRecipes.map((similarRecipe) => (
                    <RecipeCard
                      key={similarRecipe.recipe_id}
                      id={similarRecipe.recipe_id}
                      title={similarRecipe.title}
                      image={similarRecipe.image_url || "/placeholder.svg?height=200&width=300"}
                      description={similarRecipe.description}
                      tags={similarRecipe.tags || []}
                      likes={similarRecipe.likes_count || 0}
                      views={similarRecipe.views_count || 0}
                      onCollect={handleCollectRecipe}
                    />
                  ))
                ) : (
                  // Information to display when there are no similar recipes
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

