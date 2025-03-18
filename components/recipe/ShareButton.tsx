import { useState } from "react"
import { Share2, Facebook, Instagram, Copy, X, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"

interface ShareButtonProps {
  url?: string
  title?: string
  description?: string
}

export function ShareButton({ url, title, description }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const shareTitle = title || "Check out this recipe!"
  const shareDescription = description || "I found this amazing recipe on Cooking Circle."
  
  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`,
      "_blank"
    )
    setIsOpen(false)
  }
  
  const shareToX = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      "_blank"
    )
    setIsOpen(false)
  }
  
  const shareToInstagram = () => {
    // Note: Instagram doesn't have a direct share URL like other platforms
    // This is a workaround to open Instagram - users will need to manually share
    window.open(
      `https://instagram.com/`,
      "_blank"
    )
    setIsOpen(false)
    toast({
      title: "Instagram sharing",
      description: "Instagram doesn't support direct sharing. Copy the link and share it manually.",
    })
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        toast({
          title: "Link copied!",
          description: "Recipe link has been copied to clipboard",
        })
        setIsOpen(false)
      },
      (err) => {
        console.error("Could not copy link: ", err)
        toast({
          title: "Copy failed",
          description: "Could not copy link, please copy manually",
          variant: "destructive",
        })
      }
    )
  }
  
  const handlePrint = () => {
    window.print()
  }
  
  return (
    <div className="flex gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline-block">Share</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end">
          <div className="space-y-2">
            <h3 className="font-medium text-sm px-2 py-1">Share to Social Media</h3>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="sm" className="justify-start" onClick={shareToFacebook}>
                <Facebook className="h-4 w-4 mr-2" />
                Share to Facebook
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={shareToX}>
                <X className="h-4 w-4 mr-2" />
                Share to X
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={shareToInstagram}>
                <Instagram className="h-4 w-4 mr-2" />
                Share to Instagram
              </Button>
              <Button variant="ghost" size="sm" className="justify-start" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="sm" className="gap-1" onClick={handlePrint}>
        <Printer className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:inline-block">Print</span>
      </Button>
    </div>
  )
} 