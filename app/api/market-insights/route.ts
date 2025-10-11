import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const selectedCity = searchParams.get("city") || "Alaska"

  try {
    const supabase = await createClient()

    // First, fetch the state ID from the state_lookup table
    const { data: stateData, error: stateError } = await supabase
      .from("state_lookup")
      .select("state_id, state_num")
      .eq("state", selectedCity)
      .single()

    if (stateError) {
      console.error("Error fetching state ID:", stateError)
      return NextResponse.json(
        { error: "Error fetching state data" },
        { status: 500 }
      )
    }

    const stateNum = stateData?.state_num

    // Fetch all predictions for the selected state
    const { data: predictionData, error: predictionError } = await supabase
      .from("state_predictions")
      .select("*")
      .eq("state_num", stateNum)
      .order("year", { ascending: true })
      .order("month", { ascending: true })

    // Then fetch historical data using the state ID
    const { data: historicalData, error: historicalError } = await supabase
      .from("state_market")
      .select(`
        year,
        month,
        state_num,
        median_listing_price,
        average_listing_price,
        median_listing_price_per_square_foot,
        total_listing_count,
        median_days_on_market
      `)
      .eq("state_num", stateNum)
      .order("year", { ascending: true })
      .order("month", { ascending: true })

    if (predictionError) {
      console.error("Error fetching prediction data:", predictionError)
    }

    if (historicalError) {
      console.error("Error fetching historical data:", historicalError)
    }

    // Find the closest future prediction
    let closestPrediction = null
    if (predictionData && predictionData.length > 0) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1 // getMonth() returns 0-11

      closestPrediction =
        predictionData.find(
          (pred) =>
            pred.year > currentYear ||
            (pred.year === currentYear && pred.month >= currentMonth)
        ) || predictionData[predictionData.length - 1] // fallback to latest if no future predictions

      console.log("Closest future prediction:", closestPrediction)
    }

    // Format data for charts
    let formattedData: any[] = []
    if (historicalData && historicalData.length > 0) {
      console.log(
        "Historical data fetched successfully:",
        historicalData.length,
        "records"
      )

      formattedData = historicalData.map((item) => {
        const date = new Date(item.year, item.month - 1)
        return {
          date: date.toISOString(),
          month: date.toLocaleDateString("en-US", { month: "short" }),
          monthYear: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          median_listing_price: item.median_listing_price,
          average_listing_price: item.average_listing_price,
          total_listing_count: item.total_listing_count,
          median_days_on_market: item.median_days_on_market,
          isForecast: false,
        }
      })

      // Add all prediction points as forecast data
      if (predictionData && predictionData.length > 0) {
        predictionData.forEach((prediction) => {
          const forecastDate = new Date(prediction.year, prediction.month - 1)
          formattedData.push({
            date: forecastDate.toISOString(),
            month: forecastDate.toLocaleDateString("en-US", { month: "short" }),
            monthYear: forecastDate.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            }),
            median_listing_price: prediction.median_listing_price,
            average_listing_price: prediction.average_listing_price,
            total_listing_count: prediction.total_listing_count,
            median_days_on_market: prediction.median_days_on_market,
            isForecast: true,
          })
        })
      }

      // Sort by date
      formattedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    }

    return NextResponse.json({
      marketData: closestPrediction,
      historicalData: historicalData || [],
      chartData: formattedData,
    })
  } catch (error) {
    console.error("Error in market insights API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
