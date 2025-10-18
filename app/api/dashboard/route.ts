import { BigQuery } from "@google-cloud/bigquery"
import { NextRequest, NextResponse } from "next/server"
import * as path from "path"

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), "service_keys.json"),
  projectId: "fourth-webbing-474805-j5"
})

export async function GET(request: NextRequest) {
  try {
    // Check if the request is specifically for investor data
    const userRole = request.nextUrl.searchParams.get('role')
    const isInvestor = userRole === 'investor'
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

    // Investor-specific queries
    let highestGrowthStatesResults: any[] = []
    let highestGrowthCountiesResults: any[] = []
    let consistentGrowthStatesResults: any[] = []
    let consistentGrowthCountiesResults: any[] = []
    let stableStatesResults: any[] = []

    if (isInvestor) {
      // Top 5 States with Highest Price Growth
      const highestGrowthStatesQuery = await bigquery.query({
        query: `
          SELECT 
            sl.state,
            sm.median_listing_price,
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
          AND sm.median_listing_price_mm > 0
          ORDER BY sm.median_listing_price_mm DESC
          LIMIT 5
        `
      })
      highestGrowthStatesResults = highestGrowthStatesQuery[0]

      // Top 5 Counties with Highest Price Growth
      const highestGrowthCountiesQuery = await bigquery.query({
        query: `
          SELECT 
            cl.county_name,
            sl.state,
            cm.median_listing_price,
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
          AND cm.median_listing_price_mm > 0
          ORDER BY cm.median_listing_price_mm DESC
          LIMIT 5
        `
      })
      highestGrowthCountiesResults = highestGrowthCountiesQuery[0]

      // Top 5 States with Consistent Growth (sum of last 3 months growth)
      const consistentGrowthStatesQuery = await bigquery.query({
        query: `
          WITH recent_months AS (
            SELECT 
              state_num,
              median_listing_price_mm,
              RANK() OVER (PARTITION BY state_num ORDER BY year DESC, month DESC) as rank_order
            FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`
          ),
          state_sums AS (
            SELECT 
              state_num,
              SUM(median_listing_price_mm) as total_growth
            FROM recent_months
            WHERE rank_order <= 3
            GROUP BY state_num
            HAVING SUM(median_listing_price_mm) > 0
          )
          SELECT 
            sl.state,
            ss.total_growth as growth_3month
          FROM state_sums ss
          JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
          ON ss.state_num = sl.state_num
          ORDER BY ss.total_growth DESC
          LIMIT 5
        `
      })
      consistentGrowthStatesResults = consistentGrowthStatesQuery[0]

      // Top 5 Counties with Consistent Growth (sum of last 3 months growth)
      const consistentGrowthCountiesQuery = await bigquery.query({
        query: `
          WITH recent_months AS (
            SELECT 
              state_num,
              county_num,
              median_listing_price_mm,
              RANK() OVER (PARTITION BY state_num, county_num ORDER BY year DESC, month DESC) as rank_order
            FROM \`fourth-webbing-474805-j5.real_estate_market.county_market\`
          ),
          county_sums AS (
            SELECT 
              state_num,
              county_num,
              SUM(median_listing_price_mm) as total_growth
            FROM recent_months
            WHERE rank_order <= 3
            GROUP BY state_num, county_num
            HAVING SUM(median_listing_price_mm) > 0
          )
          SELECT 
            cl.county_name,
            sl.state,
            cs.total_growth as growth_3month
          FROM county_sums cs
          JOIN \`fourth-webbing-474805-j5.real_estate_market.county_lookup\` cl
          ON cs.county_num = cl.county_num
          JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
          ON cs.state_num = sl.state_num
          ORDER BY cs.total_growth DESC
          LIMIT 5
        `
      })
      consistentGrowthCountiesResults = consistentGrowthCountiesQuery[0]

      // Most Stable States (Low Price Volatility)
      const stableStatesQuery = await bigquery.query({
        query: `
          WITH recent_months AS (
            SELECT 
              state_num,
              median_listing_price,
              RANK() OVER (PARTITION BY state_num ORDER BY year DESC, month DESC) as rank_order
            FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`
            WHERE (year * 12 + month) >= ((SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`) * 12 + 
                                        (SELECT MAX(month) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\` 
                                         WHERE year = (SELECT MAX(year) FROM \`fourth-webbing-474805-j5.real_estate_market.state_market\`))) - 6
          ),
          state_stats AS (
            SELECT 
              state_num,
              STDDEV(median_listing_price) as price_stddev,
              AVG(median_listing_price) as price_avg,
              COUNT(*) as num_months
            FROM recent_months
            GROUP BY state_num
            HAVING COUNT(*) >= 3
          )
          SELECT 
            sl.state,
            ss.price_stddev,
            ss.price_avg,
            (ss.price_stddev / ss.price_avg) as coefficient_of_variation
          FROM state_stats ss
          JOIN \`fourth-webbing-474805-j5.real_estate_market.state_lookup\` sl
          ON ss.state_num = sl.state_num
          ORDER BY coefficient_of_variation ASC
          LIMIT 5
        `
      })
      stableStatesResults = stableStatesQuery[0]
    }

    return NextResponse.json({
      mostAffordableState: affordableStateResults[0] || null,
      mostAffordableCounty: affordableCountyResults[0] || null,
      priceDroppingStates: priceDroppingStatesResults || [],
      priceDroppingCounties: priceDroppingCountiesResults || [],
      fastSellingStates: fastSellingStatesResults || [],
      fastSellingCounties: fastSellingCountiesResults || [],
      buyerFriendlyCounties: buyerFriendlyCountiesResults || [],
      // Investor insights
      highestGrowthStates: highestGrowthStatesResults || [],
      highestGrowthCounties: highestGrowthCountiesResults || [],
      consistentGrowthStates: consistentGrowthStatesResults || [],
      consistentGrowthCounties: consistentGrowthCountiesResults || [],
      stableStates: stableStatesResults || []
    })
  } catch (error) {
    console.error("Error in dashboard API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
