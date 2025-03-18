"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Plus, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
// Import the Navigation and Footer components at the top of the file
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { NutritionForm } from "@/components/recipe/NutritionForm"

// Update the component to include Navigation and Footer
export default function CreateRecipe() {
  const [showNutrition, setShowNutrition] = useState(false)
  const [recipeId, setRecipeId] = useState<string | null>(null)

  // 在食譜創建成功後設置 recipeId
  const handleRecipeCreated = (id: string) => {
    setRecipeId(id)
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Recipe</h1>

          <Tabs defaultValue="details" className="mb-10">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                  1
                </span>
                Recipe Details
              </TabsTrigger>
              <TabsTrigger value="ingredients" className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                  2
                </span>
                Ingredients
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                  3
                </span>
                Instructions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Add the basic details about your recipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Recipe Title</Label>
                    <Input id="title" placeholder="Enter recipe title" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Briefly describe your recipe" className="min-h-[100px]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep-time">Prep Time (minutes)</Label>
                      <Input id="prep-time" type="number" placeholder="15" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cook-time">Cook Time (minutes)</Label>
                      <Input id="cook-time" type="number" placeholder="30" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servings">Servings</Label>
                      <Input id="servings" type="number" placeholder="4" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dietary Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Vegetarian",
                        "Vegan",
                        "Gluten-Free",
                        "Dairy-Free",
                        "Nut-Free",
                        "Low-Carb",
                        "Keto",
                        "Paleo",
                      ].map((tag) => (
                        <Button key={tag} variant="outline" size="sm" className="rounded-full">
                          {tag}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Plus className="h-4 w-4 mr-1" /> Add Tag
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Recipe Photos</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-40">
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Drag & drop or click to upload main photo</p>
                        <input type="file" className="hidden" />
                      </div>

                      <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-40">
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Add additional photo</p>
                        <input type="file" className="hidden" />
                      </div>

                      <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-40">
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Add additional photo</p>
                        <input type="file" className="hidden" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Nutrition Facts</Label>
                        <p className="text-sm text-muted-foreground">Add nutritional information to your recipe</p>
                      </div>
                      <Switch onCheckedChange={(checked) => setShowNutrition(checked)} />
                    </div>

                    {showNutrition && recipeId && (
                      <NutritionForm recipeId={recipeId} />
                    )}
                    
                    {showNutrition && !recipeId && (
                      <div className="bg-muted p-4 rounded-md text-center">
                        <p className="text-sm text-muted-foreground">
                          營養成分資訊可在創建食譜基本信息後編輯
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button>Next: Ingredients</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recipe Ingredients</CardTitle>
                  <CardDescription>List all ingredients needed for your recipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input placeholder="Ingredient name (e.g., All-purpose flour)" />
                        </div>
                        <div className="w-24">
                          <Input placeholder="Amount" type="text" />
                        </div>
                        <div className="w-28">
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="g">grams</SelectItem>
                              <SelectItem value="kg">kilograms</SelectItem>
                              <SelectItem value="ml">milliliters</SelectItem>
                              <SelectItem value="l">liters</SelectItem>
                              <SelectItem value="cup">cups</SelectItem>
                              <SelectItem value="tbsp">tablespoons</SelectItem>
                              <SelectItem value="tsp">teaspoons</SelectItem>
                              <SelectItem value="piece">pieces</SelectItem>
                              <SelectItem value="whole">whole</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Ingredient
                  </Button>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline">Back: Details</Button>
                    <Button>Next: Instructions</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cooking Instructions</CardTitle>
                  <CardDescription>Add step-by-step instructions for your recipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium mt-1">
                          {index}
                        </div>
                        <Textarea placeholder={`Step ${index} instructions`} className="flex-1 min-h-[100px]" />
                        <Button variant="ghost" size="icon" className="mt-1">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Step
                  </Button>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline">Back: Ingredients</Button>
                    <Button>Publish Recipe</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}

