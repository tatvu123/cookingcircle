// components/common/SearchBar.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  placeholder: string
}

export function SearchBar({ placeholder }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a search query!")
      return
    }
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="relative w-full">
      <Input
        type="search"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch()
        }}
        className="w-full pl-12 py-2 md:py-3 pr-4 text-sm md:text-base rounded-md border-gray-200 bg-white focus:border-gray-300 focus:ring-0"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <button
        onClick={handleSearch}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-black text-white rounded-md text-sm"
      >
        Find
      </button>
    </div>
  )
}
