import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, session_id } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json({ error: "Session ID is required and must be a string" }, { status: 400 })
    }

    const sqlAgentUrl = process.env.NEXT_PUBLIC_SQL_AGENT_URL 

    // Updated to match new Python backend structure
    const requestBody = {
      session_id: session_id,
      message: message
    }

    const response = await fetch(`${sqlAgentUrl}/chat`, {  // Changed from '/ask' to '/chat'
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Python API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Transform response to match frontend expectations
    return NextResponse.json({
      answer: data.response || data.message || "No response received",
      session_id: data.session_id,
      message_count: data.message_count,
      redis_status: data.redis_status
    })
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
