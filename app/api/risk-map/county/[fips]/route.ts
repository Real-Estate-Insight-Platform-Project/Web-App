import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: { fips: string } }) {
  const fips = (params?.fips || "").trim()
  if (!/^\d{5}$/.test(fips)) {
    return NextResponse.json({ error: "Invalid FIPS (5 digits)" }, { status: 400 })
  }

  try {
    const base = process.env.NEXT_PUBLIC_PYTHON_API_URL
    const url = `${base}/risk/county/${fips}`
    const r = await fetch(url, { cache: "no-store" })
    if (!r.ok) {
      return NextResponse.json({ error: `backend error`, status: r.status }, { status: r.status })
    }
    const data = await r.json()
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" },
    })
  } catch (err: any) {
    return NextResponse.json({ error: "County fetch failed", details: err?.message || "unknown" }, { status: 500 })
  }
}
