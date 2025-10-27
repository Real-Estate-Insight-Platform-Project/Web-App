"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, TrendingUp } from "lucide-react"

interface Step1Props {
  userType: "buyer" | "seller"
  onUserTypeChange: (type: "buyer" | "seller") => void
  onNext: () => void
}

export function Step1UserType({ userType, onUserTypeChange, onNext }: Step1Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Let's get started!</h2>
        <p className="text-lg text-gray-600">Are you buying or selling a property?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buyer Option */}
        <Card
          className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
            userType === "buyer"
              ? "border-red-500 border-2 shadow-xl ring-4 ring-red-100"
              : "border-gray-200 hover:border-red-300 hover:shadow-lg"
          }`}
          onClick={() => onUserTypeChange("buyer")}
        >
          <CardContent className="p-8 text-center space-y-4">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-colors ${
                userType === "buyer"
                  ? "bg-red-600"
                  : "bg-red-100"
              }`}
            >
              <Home
                className={`h-10 w-10 ${
                  userType === "buyer" ? "text-white" : "text-red-600"
                }`}
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Buyer</h3>
              <p className="text-sm text-gray-600 mt-2">
                I'm looking to purchase a property
              </p>
            </div>
            {userType === "buyer" && (
              <div className="flex items-center justify-center gap-2 text-red-600 font-semibold">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                Selected
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seller Option */}
        <Card
          className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
            userType === "seller"
              ? "border-red-500 border-2 shadow-xl ring-4 ring-red-100"
              : "border-gray-200 hover:border-red-300 hover:shadow-lg"
          }`}
          onClick={() => onUserTypeChange("seller")}
        >
          <CardContent className="p-8 text-center space-y-4">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-colors ${
                userType === "seller"
                  ? "bg-red-600"
                  : "bg-red-100"
              }`}
            >
              <TrendingUp
                className={`h-10 w-10 ${
                  userType === "seller" ? "text-white" : "text-red-600"
                }`}
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Seller</h3>
              <p className="text-sm text-gray-600 mt-2">
                I'm looking to sell my property
              </p>
            </div>
            {userType === "seller" && (
              <div className="flex items-center justify-center gap-2 text-red-600 font-semibold">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                Selected
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onNext}
          size="lg"
          className="px-12 bg-red-600 hover:bg-red-700 text-white text-lg"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
