"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Bot, User, Loader2, AlertCircle, RotateCcw, ExternalLink } from "lucide-react"
import { 
  getSessionId, 
  createNewSession, 
  saveSessionMessages, 
  loadSessionMessages, 
  cleanupOldSessions,
  type Message 
} from "@/lib/chatSession"
import { handlePropertyLinkClick } from "@/lib/navigationUtils"
import { useSessionPreservation } from "@/lib/useChatSession"

export default function ChatAssistantPage() {
  const [sessionId, setSessionId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize session and load messages on component mount
  useEffect(() => {
    const initializeSession = () => {
      const currentSessionId = getSessionId()
      setSessionId(currentSessionId)
      
      // Load existing messages for this session
      const existingMessages = loadSessionMessages(currentSessionId)
      
      if (existingMessages.length === 0) {
        // If no existing messages, show welcome message
        const welcomeMessage: Message = {
          id: "welcome",
          content:
            "Hello! I'm your AI assistant for real estate data analysis. I can help you query property information, market analytics, and provide insights based on our database. What would you like to know?",
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
        saveSessionMessages(currentSessionId, [welcomeMessage])
      } else {
        setMessages(existingMessages)
      }
      
      // Clean up old sessions
      cleanupOldSessions()
    }

    initializeSession()
  }, [])

  // Save messages whenever they change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      saveSessionMessages(sessionId, messages)
    }
  }, [sessionId, messages])

  // Use session preservation hook
  useSessionPreservation(messages)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !sessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call the Python API endpoint with session_id
      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          session_id: sessionId 
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Log session info for debugging (optional)
      if (data.message_count || data.redis_status) {
        console.log('Session info:', {
          message_count: data.message_count,
          redis_status: data.redis_status,
          session_id: data.session_id
        })
      }

      // Remove loading message and add actual response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id)
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            content: data.answer || data.error || "Sorry, I couldn't process your request.",
            role: "assistant",
            timestamp: new Date(),
            error: !!data.error,
          },
        ]
      })
    } catch (error) {
      console.error("Chat API error:", error)

      // Remove loading message and add error message
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id)
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            content: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
            role: "assistant",
            timestamp: new Date(),
            error: true,
          },
        ]
      })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleResetChat = async () => {
    try {
      // Clear session on backend first
      if (sessionId) {
        const backendUrl = process.env.NEXT_PUBLIC_SQL_AGENT_URL
        await fetch(`${backendUrl}/session/${sessionId}`, {
          method: 'DELETE'
        }).catch(() => {
          // If backend is not available, continue with frontend reset
          console.log('Backend session clear failed, continuing with frontend reset')
        })
      }
    } catch (error) {
      console.log('Backend session clear failed, continuing with frontend reset')
    }

    // Create new session and reset UI
    const newSessionId = createNewSession()
    setSessionId(newSessionId)
    
    const welcomeMessage: Message = {
      id: "welcome",
      content:
        "Hello! I'm your AI assistant for real estate data analysis. I can help you query property information, market analytics, and provide insights based on our database. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    }
    
    setMessages([welcomeMessage])
    saveSessionMessages(newSessionId, [welcomeMessage])
    inputRef.current?.focus()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessageContent = (content: string) => {
    // Enhanced property card pattern detection for the backend response format
    const propertyCardPattern = /(\d+\)) (.+?)\n(.+?)\n(.+?)\n💰 (.+?)\n🔗 View details[:\s]*\n(https?:\/\/[^\s\n]+)/g
    const propertyMatches = [...content.matchAll(propertyCardPattern)]

    if (propertyMatches.length > 0) {
      return (
        <div className="space-y-4">
          {/* Show header text if present */}
          {content.split(propertyCardPattern)[0].trim() && (
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm font-medium text-blue-800 whitespace-pre-wrap">
                {content.split(propertyCardPattern)[0].trim()}
              </p>
            </div>
          )}
          
          {/* Render property cards */}
          <div className="space-y-3">
            {propertyMatches.map((match, index) => {
              const [, num, title, address, features, price, , url] = match
              
              // Parse features for better display
              const bedroomMatch = features.match(/🛏\s*(\d+)\s*bed/)
              const bathroomMatch = features.match(/🛁\s*([\d.]+)\s*bath/)
              const sqftMatch = features.match(/📐\s*([\d,]+)\s*sqft/)
              
              const beds = bedroomMatch ? bedroomMatch[1] : ''
              const baths = bathroomMatch ? bathroomMatch[1] : ''
              const sqft = sqftMatch ? sqftMatch[1] : ''
              
              // Clean price display
              const cleanPrice = price.replace(/💰\s*/, '')
              
              return (
                <Card key={index} className="overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                  <div className="p-4">
                    {/* Header with number and title */}
                    <div className="flex items-start gap-3 mb-3">
                      <Badge variant="default" className="text-xs font-bold min-w-[24px] justify-center">
                        {num.replace(')', '')}
                      </Badge>
                      <h4 className="font-semibold text-base leading-tight text-gray-900 flex-1">
                        {title}
                      </h4>
                    </div>
                    
                    {/* Address */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 leading-relaxed break-words">
                        📍 {address}
                      </p>
                    </div>
                    
                    {/* Property details */}
                    <div className="flex flex-wrap gap-4 mb-3 text-sm">
                      {beds && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <span className="font-medium">🛏</span>
                          <span>{beds} bed{beds !== '1' ? 's' : ''}</span>
                        </div>
                      )}
                      {baths && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <span className="font-medium">🛁</span>
                          <span>{baths} bath{baths !== '1' ? 's' : ''}</span>
                        </div>
                      )}
                      {sqft && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <span className="font-medium">📐</span>
                          <span>{sqft} sqft</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-lg font-bold text-green-600">
                        {cleanPrice}
                      </p>
                    </div>
                    
                    {/* Action buttons and URL display */}
                    <div className="space-y-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full text-xs font-medium"
                        onClick={() => handlePropertyLinkClick(url, messages, true)}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View Property Details
                      </Button>
                      
                      {/* URL display (truncated) */}
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-2 rounded border break-all">
                        <span className="font-medium">🔗 Source:</span> {url.replace(/^https?:\/\//, '').substring(0, 60)}...
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Show any footer text */}
          {content.split(propertyCardPattern).slice(-1)[0].trim() && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {content.split(propertyCardPattern).slice(-1)[0].trim()}
              </p>
            </div>
          )}
        </div>
      )
    }

    try {
      // Try to parse content as JSON for other structured responses
      const parsed = JSON.parse(content)
      
      if (parsed.type === 'property_results' && parsed.properties) {
        return (
          <div className="space-y-3">
            {parsed.message && (
              <p className="text-sm mb-3">{parsed.message}</p>
            )}
            <div className="grid gap-2">
              {parsed.properties.map((property: any, index: number) => (
                <Card key={index} className="p-3 bg-white border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{property.address || property.title}</h4>
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        {property.price && <p>Price: ${property.price.toLocaleString()}</p>}
                        {property.bedrooms && property.bathrooms && (
                          <p>{property.bedrooms} bed, {property.bathrooms} bath</p>
                        )}
                        {property.sqft && <p>{property.sqft.toLocaleString()} sq ft</p>}
                        {property.city && property.state && (
                          <p>{property.city}, {property.state}</p>
                        )}
                      </div>
                    </div>
                    {property.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 flex items-center gap-1"
                        onClick={() => handlePropertyLinkClick(property.link, messages, true)}
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    {property.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          // Save session before internal navigation
                          saveSessionMessages(sessionId, messages)
                          window.location.href = `/dashboard/properties/${property.id}`
                        }}
                      >
                        Details
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      }
      
      if (parsed.type === 'analysis' || parsed.type === 'insights') {
        return (
          <div className="space-y-2">
            {parsed.message && (
              <p className="text-sm whitespace-pre-wrap">{parsed.message}</p>
            )}
            {parsed.insights && (
              <div className="bg-blue-50 p-3 rounded-lg border">
                <h5 className="font-medium text-sm mb-2">Key Insights:</h5>
                <ul className="text-xs space-y-1">
                  {parsed.insights.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {parsed.links && (
              <div className="mt-3 space-y-2">
                {parsed.links.map((link: any, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (link.internal) {
                        saveSessionMessages(sessionId, messages)
                        window.location.href = link.url
                      } else {
                        handlePropertyLinkClick(link.url, messages, true)
                      }
                    }}
                  >
                    {link.text || link.title}
                    {!link.internal && <ExternalLink className="h-3 w-3 ml-1" />}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )
      }
    } catch (error) {
      // If content is not JSON or parsing fails, treat as regular text
    }

    // Enhanced link detection with better formatting
    const linkRegex = /(https?:\/\/[^\s\n]+)/g
    const parts = content.split(linkRegex)
    
    return (
      <div className="text-sm whitespace-pre-wrap break-words">
        {parts.map((part, index) => {
          if (linkRegex.test(part)) {
            return (
              <div key={index} className="my-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs break-all max-w-full"
                  onClick={() => handlePropertyLinkClick(part, messages, true)}
                >
                  <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{part.replace(/^https?:\/\//, '').substring(0, 40)}...</span>
                </Button>
              </div>
            )
          }
          return <span key={index}>{part}</span>
        })}
      </div>
    )
  }

  const exampleQuestions = [
    "Show me properties under $400k with 3+ bedrooms",
    "Find houses in California with low natural disaster risk",
    "What's the market trend for Austin, Texas?",
    "Show properties near universities in New York",
    "Find condos in Florida under $300k",
    "What are the lowest risk counties for investment?",
    "Show me properties with the best flood ratings",
    "Find properties in buyer-friendly markets"
  ]

  const handleExampleClick = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 p-6 flex gap-6 min-h-0">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header - Fixed */}
          <div className="flex-shrink-0 bg-muted/20 p-4 border border-b-0 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-medium">Chat Assistant</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChat}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Chat
            </Button>
          </div>

          {/* Messages Area - Scrollable with proper height */}
          <div className="flex-1 min-h-0 border-l border-r border-border bg-background">
            <div 
              className="h-full overflow-y-auto" 
              ref={scrollAreaRef}
              style={{ height: 'calc(100vh - 200px)' }}
            >
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 break-words overflow-hidden ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.error
                            ? "bg-red-50 border border-red-200 text-red-800"
                            : "bg-muted"
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          {message.error && (
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Error</span>
                            </div>
                          )}
                          {message.role === "assistant" ? 
                            renderMessageContent(message.content) : 
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          }
                        </>
                      )}
                      <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="h-4"></div>
              </div>
            </div>
          </div>

          {/* Fixed Input at Bottom */}
          <div className="flex-shrink-0 bg-background border border-t-0 border-border rounded-b-lg">
            <div className="p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about properties, market trends, or analytics..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Fixed Sidebar */}
        <div className="w-80 flex flex-col space-y-6 min-h-0">
          {/* Session Info */}
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg">Session Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Session ID:</span>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {sessionId.slice(-8)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Messages:</span>
                  <Badge variant="outline" className="text-xs">
                    {messages.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="secondary" className="text-xs text-green-600">
                    Auto-saved
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your chat history is preserved across page navigations. Links clicked from chat responses will maintain your session.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Example Questions */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-lg">Example Questions</CardTitle>
              <CardDescription>Try these sample queries to get started</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-2">
                {exampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left h-auto p-3 bg-transparent justify-start whitespace-normal break-words"
                    onClick={() => handleExampleClick(question)}
                    disabled={isLoading}
                  >
                    <span className="text-sm leading-relaxed">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
