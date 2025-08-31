"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, DollarSign, Home, Plus, BarChart3, Calculator } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import Link from "next/link"

interface InvestmentAnalysis {
  id: string
  property_id: string
  purchase_price: number
  down_payment: number
  loan_amount: number
  interest_rate: number
  loan_term: number
  monthly_rent: number
  monthly_expenses: number
  cash_flow: number
  cap_rate: number
  roi: number
  created_at: string
  properties: {
    id: string
    title: string
    address: string
    city: string
    state: string
    property_type: string
    bedrooms: number
    bathrooms: number
    square_feet: number
  }
}

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<InvestmentAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from("investment_analysis")
        .select(`
          *,
          properties (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setInvestments(data as InvestmentAnalysis[])
      }
    }
    setLoading(false)
  }

  // Calculate portfolio metrics
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.purchase_price, 0)
  const totalCashFlow = investments.reduce((sum, inv) => sum + (inv.cash_flow || 0), 0)
  const averageROI =
    investments.length > 0 ? investments.reduce((sum, inv) => sum + (inv.roi || 0), 0) / investments.length : 0
  const averageCapRate =
    investments.length > 0 ? investments.reduce((sum, inv) => sum + (inv.cap_rate || 0), 0) / investments.length : 0

  // Prepare chart data
  const propertyTypeData = investments.reduce((acc: any[], inv) => {
    const type = inv.properties.property_type
    const existing = acc.find((item) => item.name === type)
    if (existing) {
      existing.value += 1
      existing.investment += inv.purchase_price
    } else {
      acc.push({
        name: type,
        value: 1,
        investment: inv.purchase_price,
      })
    }
    return acc
  }, [])

  const cashFlowData = investments.map((inv) => ({
    property: inv.properties.title.substring(0, 20) + "...",
    cashFlow: inv.cash_flow || 0,
    roi: inv.roi || 0,
  }))

  const COLORS = ["#dc2626", "#7c2d12", "#991b1b", "#b91c1c", "#ef4444"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Portfolio</h1>
          <p className="text-muted-foreground mt-2">Track and analyze your real estate investments</p>
        </div>
        <Link href="/dashboard/analysis">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Portfolio Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalInvestment.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{investments.length} properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${totalCashFlow.toFixed(0)}
                </div>
                <div className="flex items-center text-xs">
                  {totalCashFlow >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className="text-muted-foreground">
                    {totalCashFlow >= 0 ? "Positive" : "Negative"} cash flow
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageROI.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Return on investment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Cap Rate</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageCapRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Capitalization rate</p>
              </CardContent>
            </Card>
          </div>

          {investments.length > 0 ? (
            <>
              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Distribution</CardTitle>
                    <CardDescription>Investment by property type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={propertyTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {propertyTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any, name) => [value, `${name} properties`]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cash Flow Analysis</CardTitle>
                    <CardDescription>Monthly cash flow by property</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashFlowData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="property" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`$${value}`, "Cash Flow"]} />
                          <Bar dataKey="cashFlow" fill="#dc2626" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Property List */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Properties</CardTitle>
                  <CardDescription>Detailed view of your investment portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investments.map((investment) => (
                      <div key={investment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{investment.properties.title}</h3>
                              <Badge variant="secondary" className="capitalize">
                                {investment.properties.property_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {investment.properties.address}, {investment.properties.city},{" "}
                              {investment.properties.state}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Purchase Price</p>
                                <p className="font-medium">${investment.purchase_price.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Monthly Rent</p>
                                <p className="font-medium">${investment.monthly_rent?.toLocaleString() || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Cash Flow</p>
                                <p
                                  className={`font-medium ${(investment.cash_flow || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  ${investment.cash_flow?.toFixed(0) || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">ROI</p>
                                <p className="font-medium">{investment.roi?.toFixed(1) || "N/A"}%</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Calculator className="h-4 w-4 mr-2" />
                              Edit Analysis
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No investments yet</h3>
                <p className="mb-4">Start building your portfolio by analyzing potential investment properties.</p>
                <Link href="/dashboard/analysis">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Investment
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
