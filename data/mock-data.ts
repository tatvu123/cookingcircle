// 食譜資料模擬檔案，用於 Supabase 資料導入

// 食譜基本資訊
export const recipeData = {
  title: "Homemade Margherita Pizza",
  description: "A classic Italian pizza with fresh mozzarella, tomatoes, and basil on a crispy homemade crust.",
  image_url: "/placeholder.svg?height=600&width=1200", // 將來會替換為真實圖片 URL
  cooking_time: 30,
  servings: 4,
  difficulty: "Medium",
  tags: ["Italian", "Vegetarian"]
};

// 食材清單
export const ingredientsData = [
  { name: "All-purpose flour", quantity: "2 1/4", unit: "cups", notes: "(280g)" },
  { name: "Salt", quantity: "1", unit: "teaspoon", notes: "" },
  { name: "Instant yeast", quantity: "1", unit: "teaspoon", notes: "" },
  { name: "Warm water", quantity: "3/4", unit: "cup", notes: "(180ml)" },
  { name: "Olive oil", quantity: "1", unit: "tablespoon", notes: "plus more for brushing" },
  { name: "Crushed tomatoes", quantity: "1", unit: "can", notes: "(14oz)" },
  { name: "Garlic", quantity: "2", unit: "cloves", notes: "minced" },
  { name: "Dried oregano", quantity: "1", unit: "teaspoon", notes: "" },
  { name: "Fresh mozzarella cheese", quantity: "8", unit: "oz", notes: "sliced" },
  { name: "Fresh basil leaves", quantity: "", unit: "to taste", notes: "" },
  { name: "Salt and pepper", quantity: "", unit: "to taste", notes: "" }
];

// 製作步驟
export const instructionsData = [
  { step_number: 1, description: "In a large bowl, mix flour, salt, and yeast. Add warm water and olive oil, and stir until a dough forms." },
  { step_number: 2, description: "Knead the dough on a floured surface for about 5 minutes until smooth and elastic. Place in an oiled bowl, cover, and let rise for 1 hour." },
  { step_number: 3, description: "Preheat your oven to 475°F (245°C) with a pizza stone or baking sheet inside." },
  { step_number: 4, description: "Mix crushed tomatoes with minced garlic, dried oregano, salt, and pepper to make the sauce." },
  { step_number: 5, description: "Punch down the dough and roll it out on a floured surface to your desired thickness." },
  { step_number: 6, description: "Transfer the dough to a piece of parchment paper. Spread the tomato sauce evenly, leaving a border for the crust." },
  { step_number: 7, description: "Arrange mozzarella slices on top of the sauce." },
  { step_number: 8, description: "Carefully transfer the pizza with the parchment paper onto the preheated stone or baking sheet." },
  { step_number: 9, description: "Bake for 12-15 minutes until the crust is golden and the cheese is bubbly." },
  { step_number: 10, description: "Remove from the oven, top with fresh basil leaves, drizzle with olive oil, and serve hot." }
];

// 評論資料
export const commentsData = [
  {
    user: {
      username: "Julia Chen",
      profile_image: "/placeholder.svg"
    },
    text: "I made this last night and it was absolutely delicious! The crust came out perfectly crispy. I added some red pepper flakes for a bit of heat.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    user: {
      username: "Mark Johnson",
      profile_image: "/placeholder.svg"
    },
    text: "Great recipe! I substituted the all-purpose flour with 00 flour and it made the crust even better. Will definitely make again.",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
  },
  {
    user: {
      username: "Sarah Williams",
      profile_image: "/placeholder.svg"
    },
    text: "My family loved this pizza! It was so much better than takeout. I'm wondering if I can prepare the dough ahead of time and refrigerate it?",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks ago
  }
];

// 營養成分
export const nutritionData = {
  calories: 320,
  protein: 12,
  carbohydrates: 42,
  fat: 10,
  fiber: 2
};

// 相關產品
export const productsData = [
  {
    name: "Professional Pizza Stone",
    description: "Heavy-duty ceramic stone for perfectly crispy pizza crust",
    image: "/placeholder.svg?height=200&width=200",
    price: "$39.99",
    rating: 4.8,
    purchases: 1234
  },
  {
    name: "Italian '00' Pizza Flour",
    description: "Premium fine-ground flour for authentic Neapolitan pizza",
    image: "/placeholder.svg?height=200&width=200",
    price: "$12.99",
    rating: 4.9,
    purchases: 2156
  },
  {
    name: "Pizza Cutter Wheel",
    description: "Professional stainless steel pizza cutter for clean slices",
    image: "/placeholder.svg?height=200&width=200",
    price: "$14.99",
    rating: 4.7,
    purchases: 876
  }
];

// 相似食譜
export const similarRecipesData = [
  {
    id: "10",
    title: "Focaccia Bread",
    image: "/placeholder.svg?height=200&width=300",
    description: "Italian flatbread with olive oil, herbs and sea salt",
    tags: ["Italian", "Bread"],
    likes: 87,
    views: 756
  },
  {
    id: "11",
    title: "Caprese Salad",
    image: "/placeholder.svg?height=200&width=300",
    description: "Fresh tomatoes, mozzarella and basil with balsamic glaze",
    tags: ["Italian", "Salad"],
    likes: 65,
    views: 543
  }
]; 