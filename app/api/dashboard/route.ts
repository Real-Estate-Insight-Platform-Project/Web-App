import { BigQuery } from "@google-cloud/bigquery"
import { NextRequest, NextResponse } from "next/server"
import * as path from "path"

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), "service_keys.json"),
  projectId: "fourth-webbing-474805-j5"
})

export async function GET(request: NextRequest) {
  try {
    // Most Affordable State
    const [affordableStateResults] = await bigquery.query({
      query: `
        SELECT 
          sl.state,
          sm.median_listing_price
        FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\` sm
        JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
        ON sm.state_num = sl.state_num
        WHERE sm.year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`)
        AND sm.month = (
          SELECT MAX(month) 
          FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\` 
          WHERE year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`)
        )
        ORDER BY sm.median_listing_price ASC
        LIMIT 1
      `
    })

    // Most Affordable County
    const [affordableCountyResults] = await bigquery.query({
      query: `
        SELECT 
          cl.county_name,
          sl.state,
          cm.median_listing_price
        FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\` cm
        JOIN \`fourth-webbing-474805-j5.real_estate_market.county_lookup\` cl
        ON cm.county_num = cl.county_num
        JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
        ON cm.state_num = sl.state_num
        WHERE cm.year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\`)
        AND cm.month = (
          SELECT MAX(month) 
          FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\` 
          WHERE year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\`)
        )
        ORDER BY cm.median_listing_price ASC
        LIMIT 1
      `
    })

    // Top 5 States with Biggest Price Drop
    const [priceDroppingStatesResults] = await bigquery.query({
      query: `
        SELECT 
          sl.state,
          sm.median_listing_price_mm
        FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\` sm
        JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
        ON sm.state_num = sl.state_num
        WHERE sm.year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`)
        AND sm.month = (
          SELECT MAX(month) 
          FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\` 
          WHERE year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`)
        )
        AND sm.median_listing_price_mm < 0
        ORDER BY sm.median_listing_price_mm ASC
        LIMIT 5
      `
    })

    // Top 5 Counties with Biggest Price Drop
    const [priceDroppingCountiesResults] = await bigquery.query({
      query: `
        SELECT 
          cl.county_name,
          sl.state,
          cm.median_listing_price_mm
        FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\` cm
        JOIN \`fourth-webbing-474805-j5.real_estate_market.county_lookup\` cl
        ON cm.county_num = cl.county_num
        JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
        ON cm.state_num = sl.state_num
        WHERE cm.year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\`)
        AND cm.month = (
          SELECT MAX(month) 
          FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\` 
          WHERE year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\`)
        )
        AND cm.median_listing_price_mm < 0
        ORDER BY cm.median_listing_price_mm ASC
        LIMIT 5
      `
    })

    // Top 5 States with Shortest Days on Market
    const [fastSellingStatesResults] = await bigquery.query({
      query: `
        SELECT 
          sl.state,
          sm.median_days_on_market
        FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\` sm
        JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
        ON sm.state_num = sl.state_num
        WHERE sm.year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`)
        AND sm.month = (
          SELECT MAX(month) 
          FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\` 
          WHERE year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`)
        )
        ORDER BY sm.median_days_on_market ASC
        LIMIT 5
      `
    })

    // Top 5 Counties with Shortest Days on Market
    const [fastSellingCountiesResults] = await bigquery.query({
      query: `
        SELECT 
          cl.county_name,
          sl.state,
          cm.median_days_on_market
        FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\` cm
        JOIN \`fourth-webbing-474805-j5.real_estate_market.county_lookup\` cl
        ON cm.county_num = cl.county_num
        JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
        ON cm.state_num = sl.state_num
        WHERE cm.year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\`)
        AND cm.month = (
          SELECT MAX(month) 
          FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\` 
          WHERE year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\`)
        )
        ORDER BY cm.median_days_on_market ASC
        LIMIT 5
      `
    })

    // Buyer-Friendly Counties
    const [buyerFriendlyCountiesResults] = await bigquery.query({
      query: `
        SELECT 
          cl.county_name,
          sl.state,
          cp.median_listing_price
        FROM \`fourth-webbing-474805-j5.real_estate_market.county_predictions\` cp
        JOIN \`fourth-webbing-474805-j5.real_estate_market.county_lookup\` cl
        ON cp.county_num = cl.county_num
        JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
        ON cp.state_num = sl.state_num
        WHERE cp.buyer_friendly = 1
        AND cp.year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.county_predictions\`)
        AND cp.month = (
          SELECT MAX(month) 
          FROM \`fourth-webbing-474805-j5.real_estate_market.county_predictions\` 
          WHERE year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.county_predictions\`)
        )
        ORDER BY cp.median_listing_price ASC
        LIMIT 10
      `
    })

    return NextResponse.json({
      mostAffordableState: affordableStateResults[0] || null,
      mostAffordableCounty: affordableCountyResults[0] || null,
      priceDroppingStates: priceDroppingStatesResults || [],
      priceDroppingCounties: priceDroppingCountiesResults || [],
      fastSellingStates: fastSellingStatesResults || [],
      fastSellingCounties: fastSellingCountiesResults || [],
      buyerFriendlyCounties: buyerFriendlyCountiesResults || []
    })
  } catch (error) {
    console.error("Error in dashboard API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
