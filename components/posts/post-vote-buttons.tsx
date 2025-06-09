"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { votePost, getPostVotes, getUserVote } from "@/lib/actions/post-vote-actions"
import { getCurrentUser } from "@/lib/actions/auth-actions"
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import LoginForm from "@/components/auth/login-form"

type PostVoteButtonsProps = {
  postId: string
}

export default function PostVoteButtons({ postId }: PostVoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(0)
  const [downvotes, setDownvotes] = useState(0)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [votesData, userData] = await Promise.all([getPostVotes(postId), getCurrentUser()])

        if (votesData.success) {
          setUpvotes(votesData.upvotes)
          setDownvotes(votesData.downvotes)
        }

        setUser(userData)

        // If user is logged in, get their vote
        if (userData) {
          const userVoteData = await getUserVote(postId, userData._id)
          if (userVoteData.success) {
            setUserVote(userVoteData.voteType)
          }
        }
      } catch (error) {
        console.error("Error loading vote data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [postId])

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!user) {
      setShowLoginForm(true)
      return
    }

    setIsVoting(true)

    try {
      const result = await votePost(postId, user._id, voteType)

      if (result.success) {
        setUpvotes(result.upvotes)
        setDownvotes(result.downvotes)

        // Update user vote state
        if (userVote === voteType) {
          setUserVote(null) // Toggle off
        } else {
          setUserVote(voteType)
        }

        toast({
          title: "Success!",
          description: "Your vote has been recorded",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to record vote",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  if (showLoginForm && !user) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Login to Vote</h3>
            <p className="text-sm text-muted-foreground mb-4">You need to be logged in to vote on posts.</p>
          </div>
          <LoginForm onSuccess={() => setShowLoginForm(false)} />
          <Button variant="ghost" className="mt-4 w-full" onClick={() => setShowLoginForm(false)}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote("upvote")}
        disabled={isLoading || isVoting}
        className={`flex items-center gap-2 ${userVote === "upvote" ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800" : ""}`}
      >
        {isVoting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp className={`h-4 w-4 ${userVote === "upvote" ? "text-green-600 dark:text-green-400" : ""}`} />
        )}
        <span>{upvotes}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote("downvote")}
        disabled={isLoading || isVoting}
        className={`flex items-center gap-2 ${userVote === "downvote" ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800" : ""}`}
      >
        {isVoting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsDown className={`h-4 w-4 ${userVote === "downvote" ? "text-red-600 dark:text-red-400" : ""}`} />
        )}
        <span>{downvotes}</span>
      </Button>
    </div>
  )
}
