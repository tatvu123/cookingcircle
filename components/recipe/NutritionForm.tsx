"use client"

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { getNutritionByRecipeId, saveNutritionFacts, type NutritionFacts } from '@/lib/nutrition'
import { toast } from "@/components/ui/use-toast"

// Nutrition form schema
const nutritionFormSchema = z.object({
  calories: z.coerce.number().nonnegative().default(0),
  protein: z.coerce.number().nonnegative().default(0),
  carbohydrates: z.coerce.number().nonnegative().default(0),
  fat: z.coerce.number().nonnegative().default(0),
  fiber: z.coerce.number().nonnegative().default(0),
  sugar: z.coerce.number().nonnegative().optional(),
  sodium: z.coerce.number().nonnegative().optional(),
  cholesterol: z.coerce.number().nonnegative().optional(),
  serving_size: z.string().optional(),
  servings_per_recipe: z.coerce.number().positive().optional()
})

type NutritionFormValues = z.infer<typeof nutritionFormSchema>

interface NutritionFormProps {
  recipeId: string
  onSuccess?: () => void
}

export function NutritionForm({ recipeId, onSuccess }: NutritionFormProps) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Set up form
  const form = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: undefined,
      sodium: undefined,
      cholesterol: undefined,
      serving_size: '',
      servings_per_recipe: 1
    }
  })

  // Load nutrition data if it exists
  useEffect(() => {
    const loadNutrition = async () => {
      setLoading(true)
      try {
        const nutrition = await getNutritionByRecipeId(recipeId)
        if (nutrition) {
          form.reset({
            calories: nutrition.calories || 0,
            protein: nutrition.protein || 0,
            carbohydrates: nutrition.carbohydrates || 0,
            fat: nutrition.fat || 0,
            fiber: nutrition.fiber || 0,
            sugar: nutrition.sugar,
            sodium: nutrition.sodium,
            cholesterol: nutrition.cholesterol,
            serving_size: nutrition.serving_size || '',
            servings_per_recipe: nutrition.servings_per_recipe || 1
          })
        }
      } catch (error) {
        console.error('Error loading nutrition data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNutrition()
  }, [recipeId, form])

  // Handle form submission
  const onSubmit = async (values: NutritionFormValues) => {
    setSubmitting(true)
    try {
      const nutritionData: NutritionFacts = {
        recipe_id: recipeId,
        ...values
      }

      const result = await saveNutritionFacts(nutritionData)
      if (result) {
        toast({
          title: "Success",
          description: "Nutrition information saved successfully",
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save nutrition information",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving nutrition data:', error)
      toast({
        title: "Error",
        description: "An error occurred while saving nutrition information",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading nutrition data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Nutrition Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Provide nutritional details for your recipe
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories (kcal)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="carbohydrates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbohydrates (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fiber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiber (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sugar (g) (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.1" 
                        placeholder="0" 
                        value={field.value === undefined ? '' : field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="serving_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serving Size (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1 slice, 100g" {...field} />
                  </FormControl>
                  <FormDescription>
                    Describe what constitutes one serving
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="servings_per_recipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servings Per Recipe</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="1" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Nutrition Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 