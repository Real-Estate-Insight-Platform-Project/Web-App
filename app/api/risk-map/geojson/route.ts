import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const stateFips = searchParams.get("state_fips")
    const bbox = searchParams.get("bbox") // optional: "minx,miny,maxx,maxy"

    const base = process.env.NEXT_PUBLIC_PYTHON_API_URL 
    const url = new URL(stateFips ? `/risk/counties/${stateFips}.geojson` : `/risk/counties.geojson`, base)
    if (!stateFips && bbox) url.searchParams.set("bbox", bbox)

    const r = await fetch(url.toString(), { cache: "no-store" })
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
    const fc = await r.json()

    return NextResponse.json(fc, {
      headers: {
        "Content-Type": "application/geo+json",
        // allow CDN caching
        "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=3600",
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: "GeoJSON fetch failed", details: err?.message || "unknown" }, { status: 500 })
  }
}
