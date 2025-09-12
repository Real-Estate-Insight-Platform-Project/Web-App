import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required and must be a string" }, { status: 400 })
    }

    // Call the Python backend API
    const pythonApiUrl = process.env.PYTHON_API_URL

    const response = await fetch(`${pythonApiUrl}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      throw new Error(`Python API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Chat assistant API error:", error)

    return NextResponse.json(
      {
        error: "Failed to process your request. Please make sure the AI service is running and try again.",
      },
      { status: 500 },
    )
  }
}
