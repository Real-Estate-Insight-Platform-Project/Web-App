"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, DollarSign, Home, PiggyBank } from "lucide-react"

// Mock user data
const mockUser = {
  role: "buyer" as const,
  name: "John Doe",
  email: "john@example.com",
}

export default function CalculatorPage() {
  const [homePrice, setHomePrice] = useState(400000)
  const [downPayment, setDownPayment] = useState([20])
  const [loanTerm, setLoanTerm] = useState(30)
  const [interestRate, setInterestRate] = useState(6.5)
  const [propertyTax, setPropertyTax] = useState(1.2)
  const [insurance, setInsurance] = useState(1200)
  const [pmi, setPmi] = useState(0.5)

  // Calculations
  const downPaymentAmount = (homePrice * downPayment[0]) / 100
  const loanAmount = homePrice - downPaymentAmount
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanTerm * 12
  const monthlyPrincipalInterest =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1)
  const monthlyPropertyTax = (homePrice * (propertyTax / 100)) / 12
  const monthlyInsurance = insurance / 12
  const monthlyPMI = downPayment[0] < 20 ? (loanAmount * (pmi / 100)) / 12 : 0
  const totalMonthlyPayment = monthlyPrincipalInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mortgage Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate your monthly payments and explore financing options</p>
        </div>

        <Tabs defaultValue="mortgage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mortgage">Mortgage Calculator</TabsTrigger>
            <TabsTrigger value="affordability">Affordability</TabsTrigger>
            <TabsTrigger value="comparison">Loan Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="mortgage" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Loan Details
                  </CardTitle>
                  <CardDescription>Enter your loan information to calculate monthly payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Home Price */}
                  <div className="space-y-2">
                    <Label>Home Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={homePrice}
                        onChange={(e) => setHomePrice(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className="space-y-3">
                    <Label>Down Payment: {downPayment[0]}%</Label>
                    <Slider
                      value={downPayment}
                      onValueChange={setDownPayment}
                      max={30}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>3%</span>
                      <span className="font-medium">${downPaymentAmount.toLocaleString()}</span>
                      <span>30%</span>
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div className="space-y-2">
                    <Label>Loan Term</Label>
                    <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(Number(value))}>
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

                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                    />
                  </div>

                  {/* Property Tax */}
                  <div className="space-y-2">
                    <Label>Property Tax (% annually)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={propertyTax}
                      onChange={(e) => setPropertyTax(Number(e.target.value))}
                    />
                  </div>

                  {/* Home Insurance */}
                  <div className="space-y-2">
                    <Label>Home Insurance (annually)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={insurance}
                        onChange={(e) => setInsurance(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {downPayment[0] < 20 && (
                    <div className="space-y-2">
                      <Label>PMI (% annually)</Label>
                      <Input type="number" step="0.1" value={pmi} onChange={(e) => setPmi(Number(e.target.value))} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              <div className="space-y-6">
                {/* Monthly Payment Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Monthly Payment</CardTitle>
                    <CardDescription>Your estimated monthly mortgage payment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary mb-6">
                      ${Math.round(totalMonthlyPayment).toLocaleString()}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Principal & Interest</span>
                        <span className="font-medium">${Math.round(monthlyPrincipalInterest).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Property Tax</span>
                        <span className="font-medium">${Math.round(monthlyPropertyTax).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Home Insurance</span>
                        <span className="font-medium">${Math.round(monthlyInsurance).toLocaleString()}</span>
                      </div>
                      {monthlyPMI > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">PMI</span>
                          <span className="font-medium">${Math.round(monthlyPMI).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Loan Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Loan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Home className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Loan Amount</p>
                        <p className="text-lg font-semibold">${loanAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <PiggyBank className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">Down Payment</p>
                        <p className="text-lg font-semibold">${downPaymentAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Total Interest Paid</span>
                        <span className="font-medium">
                          ${Math.round(monthlyPrincipalInterest * numPayments - loanAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Cost of Loan</span>
                        <span className="font-medium">
                          ${Math.round(monthlyPrincipalInterest * numPayments).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="affordability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How Much House Can I Afford?</CardTitle>
                <CardDescription>Calculate your home buying budget based on your income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Annual Income</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="75000" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Debt Payments</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="500" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Down Payment Available</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="50000" className="pl-10" />
                      </div>
                    </div>
                    <Button className="w-full">Calculate Affordability</Button>
                  </div>
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Your Estimated Budget</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maximum Home Price</span>
                        <span className="font-medium">$325,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Payment</span>
                        <span className="font-medium">$1,875</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Debt-to-Income Ratio</span>
                        <span className="font-medium">28%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compare Loan Options</CardTitle>
                <CardDescription>See how different loan terms affect your payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Loan Term</th>
                        <th className="text-left p-2">Interest Rate</th>
                        <th className="text-left p-2">Monthly Payment</th>
                        <th className="text-left p-2">Total Interest</th>
                        <th className="text-left p-2">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { term: 15, rate: 6.0 },
                        { term: 20, rate: 6.25 },
                        { term: 30, rate: 6.5 },
                      ].map((loan) => {
                        const monthlyRate = loan.rate / 100 / 12
                        const numPayments = loan.term * 12
                        const monthlyPayment =
                          (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
                          (Math.pow(1 + monthlyRate, numPayments) - 1)
                        const totalInterest = monthlyPayment * numPayments - loanAmount
                        const totalCost = monthlyPayment * numPayments

                        return (
                          <tr key={loan.term} className="border-b">
                            <td className="p-2">{loan.term} years</td>
                            <td className="p-2">{loan.rate}%</td>
                            <td className="p-2">${Math.round(monthlyPayment).toLocaleString()}</td>
                            <td className="p-2">${Math.round(totalInterest).toLocaleString()}</td>
                            <td className="p-2">${Math.round(totalCost).toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
