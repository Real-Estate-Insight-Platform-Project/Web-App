"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Calculator, DollarSign, Percent, TrendingUp, Save, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  property_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
}

export default function InvestmentAnalysisPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Investment parameters
  const [purchasePrice, setPurchasePrice] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [downPaymentPercent, setDownPaymentPercent] = useState("25")
  const [interestRate, setInterestRate] = useState("7.0")
  const [loanTerm, setLoanTerm] = useState("30")
  const [monthlyRent, setMonthlyRent] = useState("")
  const [monthlyExpenses, setMonthlyExpenses] = useState("")
  const [notes, setNotes] = useState("")

  // Calculated results
  const [results, setResults] = useState<{
    loanAmount: number
    monthlyPayment: number
    cashFlow: number
    capRate: number
    roi: number
    cashOnCash: number
    totalCashNeeded: number
  } | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      const property = properties.find((p) => p.id === selectedProperty)
      if (property) {
        setPurchasePrice(property.price.toString())
        calculateDownPayment(property.price.toString(), downPaymentPercent)
      }
    }
  }, [selectedProperty, properties])

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("listing_status", "active")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProperties(data)
    }
  }

  const calculateDownPayment = (price: string, percent: string) => {
    const priceNum = Number.parseFloat(price) || 0
    const percentNum = Number.parseFloat(percent) || 0
    const downPaymentAmount = (priceNum * percentNum) / 100
    setDownPayment(downPaymentAmount.toString())
  }

  const handleDownPaymentPercentChange = (value: string) => {
    setDownPaymentPercent(value)
    calculateDownPayment(purchasePrice, value)
  }

  const calculateInvestment = () => {
    const price = Number.parseFloat(purchasePrice) || 0
    const downPmt = Number.parseFloat(downPayment) || 0
    const rate = Number.parseFloat(interestRate) || 0
    const term = Number.parseInt(loanTerm) || 30
    const rent = Number.parseFloat(monthlyRent) || 0
    const expenses = Number.parseFloat(monthlyExpenses) || 0

    // Calculate loan details
    const loanAmount = price - downPmt
    const monthlyRate = rate / 100 / 12
    const numPayments = term * 12
    const monthlyPayment =
      loanAmount > 0
        ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
          (Math.pow(1 + monthlyRate, numPayments) - 1)
        : 0

    // Calculate cash flow
    const cashFlow = rent - monthlyPayment - expenses

    // Calculate cap rate (NOI / Purchase Price)
    const noi = (rent - expenses) * 12
    const capRate = price > 0 ? (noi / price) * 100 : 0

    // Calculate ROI (Annual Cash Flow / Total Cash Invested)
    const annualCashFlow = cashFlow * 12
    const totalCashNeeded = downPmt + price * 0.03 // Assume 3% closing costs
    const roi = totalCashNeeded > 0 ? (annualCashFlow / totalCashNeeded) * 100 : 0

    // Calculate Cash-on-Cash return
    const cashOnCash = totalCashNeeded > 0 ? (annualCashFlow / totalCashNeeded) * 100 : 0

    setResults({
      loanAmount,
      monthlyPayment,
      cashFlow,
      capRate,
      roi,
      cashOnCash,
      totalCashNeeded,
    })
  }

  const saveAnalysis = async () => {
    if (!selectedProperty || !results) return

    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from("investment_analysis").insert({
        user_id: user.id,
        property_id: selectedProperty,
        purchase_price: Number.parseFloat(purchasePrice),
        down_payment: Number.parseFloat(downPayment),
        loan_amount: results.loanAmount,
        interest_rate: Number.parseFloat(interestRate),
        loan_term: Number.parseInt(loanTerm),
        monthly_rent: Number.parseFloat(monthlyRent),
        monthly_expenses: Number.parseFloat(monthlyExpenses),
        cash_flow: results.cashFlow,
        cap_rate: results.capRate,
        roi: results.roi,
      })

      if (!error) {
        router.push("/dashboard/portfolio")
      }
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Investment Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze potential real estate investments with detailed calculations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Analysis Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Property Selection
              </CardTitle>
              <CardDescription>Choose a property to analyze</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property">Select Property</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - ${property.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProperty && (
                <div className="p-3 bg-muted rounded-lg">
                  {(() => {
                    const property = properties.find((p) => p.id === selectedProperty)
                    return property ? (
                      <div className="text-sm">
                        <p className="font-medium">{property.title}</p>
                        <p className="text-muted-foreground">
                          {property.address}, {property.city}, {property.state}
                        </p>
                        <p className="text-muted-foreground">
                          {property.bedrooms}bd • {property.bathrooms}ba • {property.square_feet?.toLocaleString()} sqft
                        </p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
              <CardDescription>Enter your investment parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchase-price">Purchase Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="purchase-price"
                    type="number"
                    className="pl-9"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="down-payment">Down Payment ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="down-payment"
                      type="number"
                      className="pl-9"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="down-payment-percent">Down Payment (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="down-payment-percent"
                      type="number"
                      step="0.1"
                      className="pl-9"
                      value={downPaymentPercent}
                      onChange={(e) => handleDownPaymentPercentChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="interest-rate"
                      type="number"
                      step="0.01"
                      className="pl-9"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan-term">Loan Term</Label>
                  <Select value={loanTerm} onValueChange={setLoanTerm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="25">25 years</SelectItem>
                      <SelectItem value="30">30 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rental Income & Expenses</CardTitle>
              <CardDescription>Estimate your monthly income and expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-rent">Monthly Rent</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthly-rent"
                    type="number"
                    className="pl-9"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthly-expenses"
                    type="number"
                    className="pl-9"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="Property tax, insurance, maintenance, etc."
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Include property tax, insurance, maintenance, vacancy allowance, property management
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this investment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button onClick={calculateInvestment} className="w-full bg-primary hover:bg-primary/90">
                Calculate Investment Returns
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Investment Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <p className="text-sm text-muted-foreground">Monthly Cash Flow</p>
                        <p
                          className={`text-2xl font-bold ${results.cashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ${results.cashFlow.toFixed(0)}
                        </p>
                      </div>

                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <p className="text-sm text-muted-foreground">Cap Rate</p>
                        <p className="text-2xl font-bold text-primary">{results.capRate.toFixed(2)}%</p>
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">Cash-on-Cash ROI</span>
                        <span className="font-medium">{results.roi.toFixed(2)}%</span>
                      </div>

                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">Loan Amount</span>
                        <span className="font-medium">${results.loanAmount.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">Monthly Mortgage Payment</span>
                        <span className="font-medium">${results.monthlyPayment.toFixed(0)}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">Total Cash Needed</span>
                        <span className="font-medium">${results.totalCashNeeded.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 border rounded bg-muted">
                        <span className="text-sm font-medium">Annual Cash Flow</span>
                        <span className={`font-bold ${results.cashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${(results.cashFlow * 12).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Investment Quality</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Cash Flow:</span>
                          <span className={results.cashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                            {results.cashFlow >= 0 ? "Positive ✓" : "Negative ✗"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cap Rate:</span>
                          <span
                            className={
                              results.capRate >= 6
                                ? "text-green-600"
                                : results.capRate >= 4
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }
                          >
                            {results.capRate >= 6 ? "Excellent ✓" : results.capRate >= 4 ? "Good" : "Poor ✗"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span
                            className={
                              results.roi >= 10
                                ? "text-green-600"
                                : results.roi >= 6
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }
                          >
                            {results.roi >= 10 ? "Excellent ✓" : results.roi >= 6 ? "Good" : "Poor ✗"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={saveAnalysis}
                      disabled={!selectedProperty || saving}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save to Portfolio"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground">
                  Select a property and enter your investment parameters to see detailed analysis results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
