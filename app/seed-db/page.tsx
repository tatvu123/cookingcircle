"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { handleSeedPizzaRecipe } from '@/utils/supabase-seed'
import { 
  recipeData, 
  ingredientsData, 
  instructionsData, 
  commentsData 
} from '@/data/mock-data'

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; recipeId?: string } | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    try {
      const recipeId = await handleSeedPizzaRecipe()
      if (recipeId) {
        setResult({
          success: true,
          message: `成功導入食譜！食譜 ID: ${recipeId}`,
          recipeId
        })
      } else {
        setResult({
          success: false,
          message: '導入失敗，請查看控制台獲取更多信息'
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `錯誤: ${error.message || '未知錯誤'}`
      })
      console.error('Seed 錯誤:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">資料庫導入工具</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>導入資料到 Supabase</CardTitle>
              <CardDescription>
                將模擬的披薩食譜資料導入到 Supabase 資料庫
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">這將創建以下內容:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>用戶資料</li>
                <li>披薩食譜基本信息</li>
                <li>{ingredientsData.length} 個食材項目</li>
                <li>{instructionsData.length} 個製作步驟</li>
                <li>{commentsData.length} 個評論</li>
              </ul>
              
              {result && (
                <div className={`p-3 rounded-md mb-4 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                    {result.message}
                  </p>
                  {result.recipeId && (
                    <div className="mt-2">
                      <a href={`/recipes/${result.recipeId}`} className="text-blue-600 hover:underline">
                        查看導入的食譜 →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSeed} disabled={loading}>
                {loading ? '導入中...' : '導入測試資料'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{recipeData.title}</CardTitle>
              <CardDescription>
                預覽將被導入的食譜資料
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">描述</h3>
                  <p className="text-sm text-gray-600">{recipeData.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">標籤</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipeData.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                    <Badge variant="outline">{recipeData.cooking_time} min</Badge>
                    <Badge variant="outline">{recipeData.difficulty}</Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">食材示例</h3>
                  <ul className="text-sm space-y-1">
                    {ingredientsData.slice(0, 3).map((ing, i) => (
                      <li key={i}>
                        {ing.name}: {ing.quantity} {ing.unit} {ing.notes}
                      </li>
                    ))}
                    <li className="text-gray-500">...以及更多</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">步驟示例</h3>
                  <ul className="text-sm space-y-1">
                    {instructionsData.slice(0, 2).map((ins) => (
                      <li key={ins.step_number}>
                        {ins.step_number}. {ins.description.substring(0, 60)}...
                      </li>
                    ))}
                    <li className="text-gray-500">...以及更多</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-yellow-800 mb-2">使用須知</h2>
          <ul className="list-disc pl-5 space-y-1 text-yellow-700">
            <li>確保已在 Supabase 中創建了所需的資料表結構</li>
            <li>此操作會覆蓋現有的同名資料</li>
            <li>如果遇到錯誤，請檢查控制台輸出的詳細信息</li>
            <li>執行操作前，請確保您的 Supabase API Key 已正確設置在 .env.local 文件中</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  )
} 