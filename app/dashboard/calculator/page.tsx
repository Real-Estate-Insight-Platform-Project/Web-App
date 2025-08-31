"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, DollarSign, Percent, PieChart } from "lucide-react"

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [downPaymentPercent, setDownPaymentPercent] = useState("20")
  const [interestRate, setInterestRate] = useState("7.0")
  const [loanTerm, setLoanTerm] = useState("30")
  const [propertyTax, setPropertyTax] = useState("1.2")
  const [homeInsurance, setHomeInsurance] = useState("1200")
  const [pmi, setPmi] = useState("0.5")
  const [hoaFees, setHoaFees] = useState("")

  const [results, setResults] = useState<{
    monthlyPayment: number
    principalAndInterest: number
    propertyTaxMonthly: number
    insuranceMonthly: number
    pmiMonthly: number
    hoaMonthly: number
    totalLoanAmount: number
    totalInterest: number
    downPaymentAmount: number
  } | null>(null)

  const calculateMortgage = () => {
    const price = Number.parseFloat(homePrice) || 0
    const downPercent = Number.parseFloat(downPaymentPercent) || 0
    const rate = Number.parseFloat(interestRate) || 0
    const years = Number.parseInt(loanTerm) || 30
    const taxRate = Number.parseFloat(propertyTax) || 0
    const insurance = Number.parseFloat(homeInsurance) || 0
    const pmiRate = Number.parseFloat(pmi) || 0
    const hoa = Number.parseFloat(hoaFees) || 0

    // Calculate down payment
    const downPaymentAmount = (price * downPercent) / 100
    const loanAmount = price - downPaymentAmount

    // Calculate monthly payment (principal and interest)
    const monthlyRate = rate / 100 / 12
    const numPayments = years * 12
    const monthlyPI =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)

    // Calculate other monthly costs
    const monthlyPropertyTax = (price * taxRate) / 100 / 12
    const monthlyInsurance = insurance / 12
    const monthlyPMI = downPercent < 20 ? (loanAmount * pmiRate) / 100 / 12 : 0
    const monthlyHOA = hoa

    // Total monthly payment
    const totalMonthly = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI + monthlyHOA

    // Total interest over life of loan
    const totalInterest = monthlyPI * numPayments - loanAmount

    setResults({
      monthlyPayment: totalMonthly,
      principalAndInterest: monthlyPI,
      propertyTaxMonthly: monthlyPropertyTax,
      insuranceMonthly: monthlyInsurance,
      pmiMonthly: monthlyPMI,
      hoaMonthly: monthlyHOA,
      totalLoanAmount: loanAmount,
      totalInterest: totalInterest,
      downPaymentAmount: downPaymentAmount,
    })
  }

  const handleDownPaymentChange = (value: string) => {
    setDownPayment(value)
    const price = Number.parseFloat(homePrice) || 0
    if (price > 0) {
      const percent = (((Number.parseFloat(value) || 0) / price) * 100).toFixed(1)
      setDownPaymentPercent(percent)
    }
  }

  const handleDownPaymentPercentChange = (value: string) => {
    setDownPaymentPercent(value)
    const price = Number.parseFloat(homePrice) || 0
    if (price > 0) {
      const amount = ((price * (Number.parseFloat(value) || 0)) / 100).toFixed(0)
      setDownPayment(amount)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mortgage Calculator</h1>
        <p className="text-muted-foreground mt-2">Calculate your monthly mortgage payments and total costs</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Loan Details
            </CardTitle>
            <CardDescription>Enter your loan information to calculate payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="home-price">Home Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="home-price"
                  type="number"
                  placeholder="500000"
                  className="pl-9"
                  value={homePrice}
                  onChange={(e) => setHomePrice(e.target.value)}
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
                    placeholder="100000"
                    className="pl-9"
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(e.target.value)}
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

            <div className="space-y-4">
              <h4 className="font-medium">Additional Costs</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="property-tax">Property Tax (%/year)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="property-tax"
                      type="number"
                      step="0.1"
                      className="pl-9"
                      value={propertyTax}
                      onChange={(e) => setPropertyTax(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="home-insurance">Home Insurance ($/year)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="home-insurance"
                      type="number"
                      className="pl-9"
                      value={homeInsurance}
                      onChange={(e) => setHomeInsurance(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pmi">PMI (%/year)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pmi"
                      type="number"
                      step="0.1"
                      className="pl-9"
                      value={pmi}
                      onChange={(e) => setPmi(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Only applies if down payment &lt; 20%</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hoa-fees">HOA Fees ($/month)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hoa-fees"
                      type="number"
                      className="pl-9"
                      value={hoaFees}
                      onChange={(e) => setHoaFees(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={calculateMortgage} className="w-full bg-primary hover:bg-primary/90">
              Calculate Payment
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {results ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Monthly Payment Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Monthly Payment</p>
                      <p className="text-3xl font-bold text-primary">${results.monthlyPayment.toFixed(0)}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">Principal & Interest</span>
                        <span className="font-medium">${results.principalAndInterest.toFixed(0)}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">Property Tax</span>
                        <span className="font-medium">${results.propertyTaxMonthly.toFixed(0)}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="text-sm">Home Insurance</span>
                        <span className="font-medium">${results.insuranceMonthly.toFixed(0)}</span>
                      </div>

                      {results.pmiMonthly > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded">
                          <span className="text-sm">PMI</span>
                          <span className="font-medium">${results.pmiMonthly.toFixed(0)}</span>
                        </div>
                      )}

                      {results.hoaMonthly > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded">
                          <span className="text-sm">HOA Fees</span>
                          <span className="font-medium">${results.hoaMonthly.toFixed(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loan Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-sm">Down Payment</span>
                      <span className="font-medium">${results.downPaymentAmount.toFixed(0)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-sm">Loan Amount</span>
                      <span className="font-medium">${results.totalLoanAmount.toFixed(0)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded">
                      <span className="text-sm">Total Interest</span>
                      <span className="font-medium">${results.totalInterest.toFixed(0)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded bg-muted">
                      <span className="text-sm font-medium">Total Cost</span>
                      <span className="font-bold">${(results.totalLoanAmount + results.totalInterest).toFixed(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Ready to Calculate</h3>
                <p className="text-muted-foreground">
                  Enter your loan details and click calculate to see your monthly payment breakdown.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
