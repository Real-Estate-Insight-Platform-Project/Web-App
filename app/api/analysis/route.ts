import { BigQuery } from "@google-cloud/bigquery"
import { NextRequest, NextResponse } from "next/server"
import * as path from "path"

const bigquery = new BigQuery({
	keyFilename: path.join(process.cwd(), "service_keys.json"),
	projectId: "fourth-webbing-474805-j5"
})

const TABLES = {
	stateLookup: "`fourth-webbing-474805-j5.real_estate_market.state_lookup`",
	countyLookup: "`fourth-webbing-474805-j5.real_estate_market.county_lookup`",
	stateInsights: "`fourth-webbing-474805-j5.real_estate_market.state_investment_insights`",
	countyInsights: "`fourth-webbing-474805-j5.real_estate_market.county_investment_insights`"
}

type RiskLevel = "Low" | "Medium" | "High"

const determineRiskLevel = (volatility: number): RiskLevel => {
	if (!Number.isFinite(volatility)) {
		return "Medium"
	}

	if (volatility <= 35) {
		return "Low"
	}

	if (volatility <= 60) {
		return "Medium"
	}

	return "High"
}

const parseHorizon = (value: string | null): number => {
	const fallback = 12
	if (!value) return fallback
	const parsed = parseInt(value, 10)
	if (Number.isNaN(parsed) || parsed <= 0) {
		return fallback
	}
	return parsed
}

interface InsightRow {
	year_month: string | number
	appreciation: number
	volatility: number
	liquidity: number
	IOI?: number
	ioi?: number
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const stateParam = searchParams.get("state")
	const countyParam = searchParams.get("county")
	const horizonParam = searchParams.get("horizon")

	if (!stateParam || !stateParam.trim()) {
		return NextResponse.json({ error: "State parameter is required." }, { status: 400 })
	}

	const state = stateParam.trim()
	const county = countyParam && countyParam.trim() ? countyParam.trim() : null
	const horizon = parseHorizon(horizonParam)

	try {
		const [stateRows] = await bigquery.query({
			query: `
				SELECT state_num, state
				FROM ${TABLES.stateLookup}
				WHERE LOWER(state) = LOWER(@state)
				LIMIT 1
			`,
			params: { state }
		})

		if (!stateRows || stateRows.length === 0) {
			return NextResponse.json({ error: "State not found." }, { status: 404 })
		}

		const stateInfo = stateRows[0] as { state_num: number; state: string }
		const stateNum = stateInfo.state_num

		let countyNum: number | null = null
		let countyName: string | null = null

		if (county) {
			const [countyRows] = await bigquery.query({
				query: `
					SELECT county_num, county_name
					FROM ${TABLES.countyLookup}
					WHERE LOWER(county_name) = LOWER(@county) AND state_num = @stateNum
					LIMIT 1
				`,
				params: { county, stateNum }
			})

			if (!countyRows || countyRows.length === 0) {
				return NextResponse.json({ error: "County not found for selected state." }, { status: 404 })
			}

			const countyInfo = countyRows[0] as { county_num: number; county_name: string }
			countyNum = countyInfo.county_num
			countyName = countyInfo.county_name
		}

		const isCountyView = countyNum !== null

		const [insightRows] = await bigquery.query({
			query: isCountyView
				? `
						SELECT year_month, appreciation, volatility, liquidity, IOI
						FROM ${TABLES.countyInsights}
						WHERE county_num = @countyNum AND state_num = @stateNum
					`
				: `
						SELECT year_month, appreciation, volatility, liquidity, IOI
						FROM ${TABLES.stateInsights}
						WHERE state_num = @stateNum
					`,
			params: isCountyView ? { countyNum, stateNum } : { stateNum }
		})

		if (!insightRows || insightRows.length === 0) {
			return NextResponse.json({ error: "No investment insights available." }, { status: 404 })
		}

		const processedRows = (insightRows as InsightRow[])
			.map(row => {
				const rawYearMonth = typeof row.year_month === "number" ? row.year_month.toString() : String(row.year_month ?? "")
				const horizonMonths = Number(row.year_month)
				const appreciation = Number(row.appreciation ?? 0)
				const volatility = Number(row.volatility ?? 0)
				const liquidity = Number(row.liquidity ?? 0)
				const ioiValue = Number((row.IOI ?? row.ioi) ?? 0)

				return {
					rawYearMonth,
					horizonMonths: Number.isFinite(horizonMonths) ? horizonMonths : null,
					appreciation,
					volatility,
					liquidity,
					ioi: ioiValue
				}
			})
			.filter(item => item.horizonMonths !== null) as Array<{
				rawYearMonth: string
				horizonMonths: number
				appreciation: number
				volatility: number
				liquidity: number
				ioi: number
			}>

		if (!processedRows.length) {
			return NextResponse.json({ error: "No valid insight records available." }, { status: 404 })
		}

		const sortedRows = [...processedRows].sort((a, b) => a.horizonMonths - b.horizonMonths)
		const targetRow = processedRows.find(row => row.horizonMonths === horizon)

		if (!targetRow) {
			return NextResponse.json({ error: `No insights available for the ${horizon}-month horizon.` }, { status: 404 })
		}

		return NextResponse.json({
			state: stateInfo.state,
			county: countyName,
			level: isCountyView ? "county" : "state",
			yearMonth: targetRow.rawYearMonth,
			horizonMonths: targetRow.horizonMonths,
			appreciation: targetRow.appreciation,
			volatility: targetRow.volatility,
			liquidity: targetRow.liquidity,
			ioi: targetRow.ioi,
			riskLevel: determineRiskLevel(targetRow.volatility),
			dataPoints: sortedRows.map(row => ({
				yearMonth: row.rawYearMonth,
				horizonMonths: row.horizonMonths,
				appreciation: row.appreciation,
				volatility: row.volatility,
				liquidity: row.liquidity,
				ioi: row.ioi
			}))
		})
	} catch (error) {
		console.error("Error fetching analysis insights:", error)
		return NextResponse.json({ error: "Internal server error." }, { status: 500 })
	}
}

