import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the Python API URL from environment variables
    const pythonApiUrl = process.env.NEXT_PUBLIC_AGENT_RECOMMENDER_URL 

    if (!pythonApiUrl) {
      return NextResponse.json({ error: "Python API URL not configured" }, { status: 500 })
    }

    // Forward the request to the Python FastAPI backend
    const response = await fetch(`${pythonApiUrl}/locations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Python API error:", errorText)
      return NextResponse.json({ error: "Failed to get locations" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in locations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
