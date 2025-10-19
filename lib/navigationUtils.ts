import { useRouter } from 'next/navigation'
import { getSessionId, saveSessionMessages } from './chatSession'
import type { Message } from './chatSession'

/**
 * Navigation utility that preserves chat session when navigating to property pages
 */
export function useSessionPreservingNavigation() {
  const router = useRouter()

  const navigateToProperty = (propertyId: string, messages?: Message[]) => {
    // Save current chat state before navigation
    const sessionId = getSessionId()
    if (messages && messages.length > 0) {
      saveSessionMessages(sessionId, messages)
    }

    // Navigate to property page
    router.push(`/dashboard/properties/${propertyId}`)
  }

  const navigateToPropertySearch = (searchParams?: Record<string, string>, messages?: Message[]) => {
    // Save current chat state before navigation
    const sessionId = getSessionId()
    if (messages && messages.length > 0) {
      saveSessionMessages(sessionId, messages)
    }

    // Build query string from search params
    const queryString = searchParams 
      ? '?' + new URLSearchParams(searchParams).toString()
      : ''

    // Navigate to property search page
    router.push(`/dashboard/search${queryString}`)
  }

  const navigateToMarketInsights = (messages?: Message[]) => {
    // Save current chat state before navigation
    const sessionId = getSessionId()
    if (messages && messages.length > 0) {
      saveSessionMessages(sessionId, messages)
    }

    // Navigate to market insights page
    router.push('/dashboard/market-insights')
  }

  const navigateWithSessionPreservation = (path: string, messages?: Message[]) => {
    // Save current chat state before navigation
    const sessionId = getSessionId()
    if (messages && messages.length > 0) {
      saveSessionMessages(sessionId, messages)
    }

    // Navigate to the specified path
    router.push(path)
  }

  return {
    navigateToProperty,
    navigateToPropertySearch,
    navigateToMarketInsights,
    navigateWithSessionPreservation
  }
}

/**
 * Handle external property links while preserving session
 */
export function handlePropertyLinkClick(
  url: string, 
  messages?: Message[], 
  openInNewTab: boolean = true
) {
  // Save current chat state before navigation
  const sessionId = getSessionId()
  if (messages && messages.length > 0) {
    saveSessionMessages(sessionId, messages)
  }

  // Open link
  if (openInNewTab) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = url
  }
}

/**
 * Enhanced property link handler that can handle both internal and external links
 */
export function createPropertyLinkHandler(messages: Message[]) {
  return (url: string, isInternal: boolean = false) => {
    if (isInternal) {
      // Extract property ID from internal URLs like /dashboard/properties/123
      const propertyIdMatch = url.match(/\/dashboard\/properties\/([^/?]+)/)
      if (propertyIdMatch) {
        const { navigateToProperty } = useSessionPreservingNavigation()
        navigateToProperty(propertyIdMatch[1], messages)
        return
      }

      // Handle other internal navigation
      const { navigateWithSessionPreservation } = useSessionPreservingNavigation()
      navigateWithSessionPreservation(url, messages)
    } else {
      // Handle external links
      handlePropertyLinkClick(url, messages, true)
    }
  }
}