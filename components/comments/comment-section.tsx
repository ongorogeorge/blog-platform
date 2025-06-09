"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getCommentsByPostId, createComment, voteComment } from "@/lib/actions/comment-actions"
import { getCurrentUser, logoutUser } from "@/lib/actions/auth-actions"
import LoginForm from "@/components/auth/login-form"
import { formatDate } from "@/lib/utils/format-date"
import { MessageSquare, ThumbsUp, ThumbsDown, Reply, User, LogOut } from "lucide-react"

type Comment = {
  _id: string
  content: string
  userId: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  createdAt: string
  upvoteCount: number
  downvoteCount: number
  upvotes: string[]
  downvotes: string[]
  replies: Comment[]
}

type CommentSectionProps = {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [commentsData, userData] = await Promise.all([getCommentsByPostId(postId), getCurrentUser()])

        setComments(commentsData)
        setUser(userData)
      } catch (error) {
        console.error("Error loading comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [postId])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowLoginForm(true)
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createComment(postId, user._id, newComment.trim())

      if (result.success) {
        setNewComment("")
        // Reload comments
        const updatedComments = await getCommentsByPostId(postId)
        setComments(updatedComments)
        toast({
          title: "Success!",
          description: "Comment posted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to post comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      setShowLoginForm(true)
      return
    }

    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await createComment(postId, user._id, replyContent.trim(), parentId)

      if (result.success) {
        setReplyContent("")
        setReplyTo(null)
        // Reload comments
        const updatedComments = await getCommentsByPostId(postId)
        setComments(updatedComments)
        toast({
          title: "Success!",
          description: "Reply posted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to post reply",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (commentId: string, voteType: "upvote" | "downvote") => {
    if (!user) {
      setShowLoginForm(true)
      return
    }

    try {
      const result = await voteComment(commentId, user._id, voteType)

      if (result.success) {
        // Update local state
        setComments(
          comments.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                upvoteCount: result.upvoteCount || 0,
                downvoteCount: result.downvoteCount || 0,
              }
            }
            return comment
          }),
        )
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to vote",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    window.location.reload()
  }

  if (showLoginForm && !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Comments ({comments.length})
          </h3>
          <Button variant="outline" onClick={() => setShowLoginForm(false)}>
            Cancel
          </Button>
        </div>
        <LoginForm onSuccess={() => setShowLoginForm(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Comments ({comments.length})
        </h3>
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Join the Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">Please login to join the discussion</p>
              <Button onClick={() => setShowLoginForm(true)}>
                <User className="mr-2 h-4 w-4" />
                Login to Comment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment._id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{comment.userId.name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed">{comment.content}</p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(comment._id, "upvote")}
                      className="h-8 px-2"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {comment.upvoteCount}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(comment._id, "downvote")}
                      className="h-8 px-2"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {comment.downvoteCount}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                    className="h-8 px-2"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                </div>

                {/* Reply Form */}
                {replyTo === comment._id && user && (
                  <div className="mt-4 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment._id)}
                          disabled={!replyContent.trim()}
                        >
                          Post Reply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyTo(null)
                            setReplyContent("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-muted space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{reply.userId.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed pl-8">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {comments.length === 0 && !isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
