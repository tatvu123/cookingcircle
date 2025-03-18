"use client"
import Image from "next/image"
import Link from "next/link"
import { Bookmark, Eye, Heart, BadgeCheck, MoreVertical, Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useRouter } from "next/navigation"

interface RecipeCardProps {
  id: string
  title: string
  image: string
  description: string
  tags: string[]
  likes: number
  views: number
  poster?: string
  isOwner?: boolean
  onDelete?: (id: string) => void
  onCollect?: (id: string, title: string) => void
}

export default function RecipeCard({
  id,
  title,
  image,
  description,
  tags,
  likes,
  views,
  poster = "Anonymous",
  isOwner = false,
  onDelete,
  onCollect,
}: RecipeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      // Here you would typically make an API call to delete the recipe
      await onDelete?.(id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Failed to delete recipe:", error)
    }
  }

  const handleEdit = () => {
    router.push(`/recipes/${id}/edit`)
  }

  return (
    <>
      <Link href={`/recipes/${id}`} className="block">
        <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md border border-gray-200 bg-white group">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="p-4 h-full flex flex-col justify-center relative">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 bg-white hover:bg-white/90"
                  onClick={(e) => {
                    e.preventDefault()
                    onCollect?.(id, title)
                  }}
                >
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Add to collection</span>
                </Button>
                <p className="text-white text-sm line-clamp-4 text-center">{description}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-1 text-black">{title}</h3>
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault()
                        handleEdit()
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-white text-black border-gray-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between text-gray-500 text-sm">
            <div className="flex items-center gap-3">
              <span className="font-medium hover:text-gray-900">{poster}</span>
              {poster === "Chef Mario" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified Chef</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{views}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Recipe"
        description="Are you sure you want to delete this recipe? This action cannot be undone."
      />
    </>
  )
}

