"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Eye, Clock, ThumbsUp, MessageSquare } from "lucide-react"

// Visit Stats Cards Component
export function VisitStatsCards({ totalVisits, uniqueVisitors }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalVisits.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Page views in selected period</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{uniqueVisitors.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Individual users in selected period</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avg. Visit Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">2m 10s</div>
          <p className="text-xs text-muted-foreground">Average time on site</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Engagement Metrics Cards Component
export function EngagementMetricsCards({ votes, comments, avgTimeOnSite }) {
  // Format time in minutes and seconds
  const minutes = Math.floor(avgTimeOnSite / 60)
  const seconds = avgTimeOnSite % 60
  const formattedTime = `${minutes}m ${seconds}s`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <ThumbsUp className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{votes.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <MessageSquare className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{comments.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Comments</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <Clock className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{formattedTime}</div>
            <p className="text-sm text-muted-foreground">Avg. Time on Site</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Device Stats Cards Component
export function DeviceStatsCards({ devices, browsers }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Device Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((item) => (
              <div key={item.device} className="flex items-center justify-between">
                <span className="capitalize">{item.device}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.count}</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(item.count / devices.reduce((sum, d) => sum + d.count, 0)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Browsers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {browsers.map((item) => (
              <div key={item.browser} className="flex items-center justify-between">
                <span>{item.browser}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.count}</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(item.count / browsers.reduce((sum, b) => sum + b.count, 0)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Popular Posts Table Component
export function PopularPostsTable({ posts }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Post</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Upvotes</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="text-right">Engagement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post._id}>
              <TableCell>
                <div className="flex flex-col">
                  <Link href={`/${post.category}/${post.slug}`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">{post.views.toLocaleString()}</TableCell>
              <TableCell className="text-right">{post.upvotes.toLocaleString()}</TableCell>
              <TableCell className="text-right">{post.comments.toLocaleString()}</TableCell>
              <TableCell className="text-right">{post.engagement.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
