import { BigQuery } from "@google-cloud/bigquery"
import { NextRequest, NextResponse } from "next/server"
import * as path from "path"

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), "app/api/market-insights/service_keys.json"),
  projectId: "fourth-webbing-474805-j5"
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const selectedCity = searchParams.get("city") || "Alaska"
  const selectedCounty = searchParams.get("county") || null
  const isCountyView = selectedCounty && selectedCounty !== "none"

  try {
    // First, fetch the state ID from the state_lookup table
    const [stateRows] = await bigquery.query({
      query: `
        SELECT state_id, state_num
        FROM \`fourth-webbing-474805-j5.real_estate_market.state_lookup\`
        WHERE state = @state
        LIMIT 1
      `,
      params: { state: selectedCity }
    })

    if (!stateRows || stateRows.length === 0) {
      return NextResponse.json(
        { error: "State not found" },
        { status: 404 }
      )
    }

    const stateNum = stateRows[0].state_num
    
    // Fetch county data if a county was specified
    let countyNum = null
    if (isCountyView) {
      const [countyRows] = await bigquery.query({
        query: `
          SELECT county_num
          FROM \`fourth-webbing-474805-j5.real_estate_market.county_lookup\`
          WHERE county_name = @countyName AND state_num = @stateNum
          LIMIT 1
        `,
        params: { 
          countyName: selectedCounty,
          stateNum 
        }
      })
      
      if (!countyRows || countyRows.length === 0) {
        return NextResponse.json(
          { error: "County not found" },
          { status: 404 }
        )
      }
      
      countyNum = countyRows[0].county_num
    }

    // Fetch predictions based on whether we're looking at state or county
    const [predictionRows] = await bigquery.query({
      query: isCountyView 
        ? `
          SELECT *
          FROM \`fourth-webbing-474805-j5.real_estate_market.county_predictions\`
          WHERE county_num = @countyNum AND state_num = @stateNum
          ORDER BY year ASC, month ASC
        `
        : `
          SELECT *
          FROM \`fourth-webbing-474805-j5.real_estate_market.state_predictions\`
          WHERE state_num = @stateNum
          ORDER BY year ASC, month ASC
        `,
      params: isCountyView ? { countyNum, stateNum } : { stateNum }
    })

    // Fetch historical data based on whether we're looking at state or county
    const [historicalRows] = await bigquery.query({
      query: isCountyView
        ? `
          SELECT
            year,
            month,
            county_num,
            state_num,
            median_listing_price,
            average_listing_price,
            median_listing_price_per_square_foot,
            total_listing_count,
            median_days_on_market
          FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\`
          WHERE county_num = @countyNum AND state_num = @stateNum
          ORDER BY year ASC, month ASC
        `
        : `
          SELECT
            year,
            month,
            state_num,
            median_listing_price,
            average_listing_price,
            median_listing_price_per_square_foot,
            total_listing_count,
            median_days_on_market
          FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`
          WHERE state_num = @stateNum
          ORDER BY year ASC, month ASC
        `,
      params: isCountyView ? { countyNum, stateNum } : { stateNum }
    })

    // Find the closest future prediction
    let closestPrediction = null
    if (predictionRows && predictionRows.length > 0) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1 // getMonth() returns 0-11

      closestPrediction =
        predictionRows.find(
          (pred: any) =>
            pred.year > currentYear ||
            (pred.year === currentYear && pred.month >= currentMonth)
        ) || predictionRows[predictionRows.length - 1] // fallback to latest if no future predictions

      console.log("Closest future prediction:", closestPrediction)
    }

    // Format data for charts
    let formattedData: any[] = []
    if (historicalRows && historicalRows.length > 0) {
      console.log(
        "Historical data fetched successfully:",
        historicalRows.length,
        "records"
      )

      formattedData = historicalRows.map((item: any) => {
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
      if (predictionRows && predictionRows.length > 0) {
        predictionRows.forEach((prediction: any) => {
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
      historicalData: historicalRows || [],
      chartData: formattedData,
      level: isCountyView ? 'county' : 'state',
      locationInfo: {
        state: selectedCity,
        county: isCountyView ? selectedCounty : null
      }
    })
  } catch (error) {
    console.error("Error in market insights API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
