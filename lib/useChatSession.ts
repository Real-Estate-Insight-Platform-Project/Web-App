import { useEffect, useState } from 'react'
import { getSessionId, saveSessionMessages, loadSessionMessages, type Message } from './chatSession'

/**
 * Hook to manage chat session across the application
 */
export function useChatSession() {
  const [sessionId, setSessionId] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initSession = () => {
      const currentSessionId = getSessionId()
      setSessionId(currentSessionId)
      setIsInitialized(true)
    }

    initSession()
  }, [])

  const saveMessages = (messages: Message[]) => {
    if (sessionId && messages.length > 0) {
      saveSessionMessages(sessionId, messages)
    }
  }

  const loadMessages = (): Message[] => {
    if (sessionId) {
      return loadSessionMessages(sessionId)
    }
    return []
  }

  const getCurrentSessionId = () => sessionId

  return {
    sessionId,
    isInitialized,
    saveMessages,
    loadMessages,
    getCurrentSessionId
  }
}

/**
 * Hook to preserve chat session when navigating away from chat
 */
export function useSessionPreservation(messages: Message[]) {
  const { saveMessages } = useChatSession()

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveMessages(messages)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveMessages(messages)
      }
    }

    // Save on page unload
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Save when tab becomes hidden
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [messages, saveMessages])

  // Save messages periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length > 0) {
        saveMessages(messages)
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(interval)
  }, [messages, saveMessages])
}

/**
 * Context value for chat session management
 */
export interface ChatSessionContextValue {
  sessionId: string
  saveSession: (messages: Message[]) => void
  loadSession: () => Message[]
  isSessionReady: boolean
}

/**
 * Get session context for property pages to restore chat when returning
 */
export function useChatSessionContext(): ChatSessionContextValue {
  const { sessionId, isInitialized, saveMessages, loadMessages } = useChatSession()

  return {
    sessionId,
    saveSession: saveMessages,
    loadSession: loadMessages,
    isSessionReady: isInitialized
  }
}