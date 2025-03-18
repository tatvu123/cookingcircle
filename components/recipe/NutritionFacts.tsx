"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getNutritionByRecipeId, type NutritionFacts as NutritionData } from '@/lib/nutrition'

interface NutritionFactsProps {
  recipeId: string
  initialData?: NutritionData
}

export function NutritionFacts({ recipeId, initialData }: NutritionFactsProps) {
  const [loading, setLoading] = useState(!initialData)
  const [nutrition, setNutrition] = useState<NutritionData | null>(initialData || null)

  useEffect(() => {
    if (!initialData) {
      const fetchNutrition = async () => {
        setLoading(true)
        const data = await getNutritionByRecipeId(recipeId)
        setNutrition(data)
        setLoading(false)
      }
      
      fetchNutrition()
    }
  }, [recipeId, initialData])

  // 格式化數值，將值和單位分開
  const formatValueOnly = (value?: number | null) => {
    if (value === undefined || value === null) return '-';
    return value.toString();
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    )
  }

  if (!nutrition) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-muted-foreground">
          Nutritional information is not available for this recipe.
        </p>
      </div>
    )
  }

  // 將營養成分組織成二維陣列，以便於分組顯示
  const nutritionPairs = [
    [
      { name: 'Calories', value: nutrition.calories, unit: 'kcal' },
      { name: 'Protein', value: nutrition.protein, unit: 'g' }
    ],
    [
      { name: 'Carbohydrates', value: nutrition.carbohydrates, unit: 'g' },
      { name: 'Fat', value: nutrition.fat, unit: 'g' }
    ],
    [
      { name: 'Fiber', value: nutrition.fiber, unit: 'g' },
      { name: 'Sugar', value: nutrition.sugar, unit: 'g' }
    ],
    [
      { name: 'Sodium', value: nutrition.sodium, unit: 'mg' },
      { name: 'Cholesterol', value: nutrition.cholesterol, unit: 'mg' }
    ]
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Per serving
      </p>

      <table className="w-full border-collapse">
        {nutritionPairs.map((pair, index) => (
          <tr key={index} className={index < nutritionPairs.length - 1 ? "border-b" : ""}>
            <td className="py-2 pr-1 text-sm font-medium">{pair[0].name}</td>
            <td className="py-2 text-sm text-right">{formatValueOnly(pair[0].value)}</td>
            <td className="py-2 pl-1 text-sm text-muted-foreground">{pair[0].unit}</td>
            
            <td className="py-2 pl-4 pr-1 text-sm font-medium">{pair[1].name}</td>
            <td className="py-2 text-sm text-right">{pair[1].value !== undefined ? formatValueOnly(pair[1].value) : '-'}</td>
            <td className="py-2 pl-1 text-sm text-muted-foreground">{pair[1].unit}</td>
          </tr>
        ))}
      </table>
    </div>
  )
} 