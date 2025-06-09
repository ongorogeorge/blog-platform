"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  getVisitStats,
  getDailyVisits,
  getTrafficSources,
  getPopularPosts,
  getEngagementMetrics,
  getDeviceStats,
} from "@/lib/actions/analytics-actions"
import { BarChart, LineChart, DonutChart } from "@/components/analytics/charts"
import { VisitStatsCards, PopularPostsTable, EngagementMetricsCards } from "@/components/analytics/stats-components"
import { Loader2, BarChart3, LineChartIcon, PieChartIcon } from "lucide-react"

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30")
  const [isLoading, setIsLoading] = useState(true)
  const [visitStats, setVisitStats] = useState({ totalVisits: 0, uniqueVisitors: 0 })
  const [dailyVisits, setDailyVisits] = useState([])
  const [trafficSources, setTrafficSources] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [engagementMetrics, setEngagementMetrics] = useState({ votes: 0, comments: 0, avgTimeOnSite: 0 })
  const [deviceStats, setDeviceStats] = useState({ devices: [], browsers: [] })

  const { toast } = useToast()

  useEffect(() => {
    async function fetchAnalyticsData() {
      setIsLoading(true)
      try {
        const days = Number.parseInt(timeRange)

        const [
          visitStatsData,
          dailyVisitsData,
          trafficSourcesData,
          popularPostsData,
          engagementMetricsData,
          deviceStatsData,
        ] = await Promise.all([
          getVisitStats(days),
          getDailyVisits(days),
          getTrafficSources(days),
          getPopularPosts(10),
          getEngagementMetrics(days),
          getDeviceStats(days),
        ])

        setVisitStats(visitStatsData)
        setDailyVisits(dailyVisitsData)
        setTrafficSources(trafficSourcesData)
        setPopularPosts(popularPostsData)
        setEngagementMetrics(engagementMetricsData)
        setDeviceStats(deviceStatsData)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [timeRange, toast])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">Insights and statistics for your blog</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading analytics data...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Visit Stats Cards */}
          <VisitStatsCards totalVisits={visitStats.totalVisits} uniqueVisitors={visitStats.uniqueVisitors} />

          {/* Daily Visits Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Visits Over Time
              </CardTitle>
              <CardDescription>Daily visits for the selected time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <LineChart data={dailyVisits} xField="date" yField="visits" label="Daily Visits" />
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources and Device Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Traffic Sources
                </CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <DonutChart data={trafficSources} categoryField="source" valueField="count" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Device Breakdown
                </CardTitle>
                <CardDescription>Devices used to access your blog</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="devices">
                  <TabsList className="mb-4">
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                    <TabsTrigger value="browsers">Browsers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="devices">
                    <div className="h-[250px]">
                      <BarChart data={deviceStats.devices} categoryField="device" valueField="count" label="Visitors" />
                    </div>
                  </TabsContent>
                  <TabsContent value="browsers">
                    <div className="h-[250px]">
                      <BarChart
                        data={deviceStats.browsers}
                        categoryField="browser"
                        valueField="count"
                        label="Visitors"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <EngagementMetricsCards
            votes={engagementMetrics.votes}
            comments={engagementMetrics.comments}
            avgTimeOnSite={engagementMetrics.avgTimeOnSite}
          />

          {/* Popular Posts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Posts</CardTitle>
              <CardDescription>Posts with the highest views and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <PopularPostsTable posts={popularPosts} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
