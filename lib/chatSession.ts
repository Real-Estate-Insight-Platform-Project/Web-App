import { v4 as uuidv4 } from 'uuid'

const SESSION_KEY = 'chat_session_id'

export interface ChatSession {
  sessionId: string
  messages: Message[]
  createdAt: Date
  lastActivity: Date
}

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isLoading?: boolean
  error?: boolean
}

/**
 * Get the current session ID from localStorage, or create a new one
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return a temporary ID
    return 'temp-' + Date.now()
  }

  try {
    let sessionId = localStorage.getItem(SESSION_KEY)
    
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem(SESSION_KEY, sessionId)
    }
    
    return sessionId
  } catch (error) {
    console.error('Error accessing localStorage:', error)
    // Fallback to a session-based ID
    return 'fallback-' + Date.now()
  }
}

/**
 * Create a new session ID and store it
 */
export function createNewSession(): string {
  const newSessionId = uuidv4()
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_KEY, newSessionId)
      // Clear any stored messages for the previous session
      clearSessionMessages()
    } catch (error) {
      console.error('Error creating new session:', error)
    }
  }
  
  return newSessionId
}

/**
 * Get the messages key for storing session messages
 */
function getMessagesKey(sessionId: string): string {
  return `chat_messages_${sessionId}`
}

/**
 * Save messages to localStorage for the current session
 */
export function saveSessionMessages(sessionId: string, messages: Message[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const messagesKey = getMessagesKey(sessionId)
    localStorage.setItem(messagesKey, JSON.stringify(messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }))))
  } catch (error) {
    console.error('Error saving session messages:', error)
  }
}

/**
 * Load messages from localStorage for the current session
 */
export function loadSessionMessages(sessionId: string): Message[] {
  if (typeof window === 'undefined') return []
  
  try {
    const messagesKey = getMessagesKey(sessionId)
    const stored = localStorage.getItem(messagesKey)
    
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  } catch (error) {
    console.error('Error loading session messages:', error)
    return []
  }
}

/**
 * Clear messages for the current session
 */
export function clearSessionMessages(): void {
  if (typeof window === 'undefined') return
  
  try {
    const sessionId = getSessionId()
    const messagesKey = getMessagesKey(sessionId)
    localStorage.removeItem(messagesKey)
  } catch (error) {
    console.error('Error clearing session messages:', error)
  }
}

/**
 * Clean up old sessions (optional - remove sessions older than 7 days)
 */
export function cleanupOldSessions(): void {
  if (typeof window === 'undefined') return
  
  try {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('chat_messages_')) {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const messages = JSON.parse(stored)
            if (messages.length > 0) {
              const lastMessage = new Date(messages[messages.length - 1].timestamp)
              if (lastMessage.getTime() < sevenDaysAgo) {
                localStorage.removeItem(key)
              }
            }
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key)
        }
      }
    })
  } catch (error) {
    console.error('Error cleaning up old sessions:', error)
  }
}