/**
 * Request deduplication utility to prevent redundant GraphQL calls
 * Uses a Map to track in-flight requests and return the same Promise
 */

type RequestKey = string
type PendingRequest = Promise<any>

const pendingRequests = new Map<RequestKey, PendingRequest>()

/**
 * Creates a unique key for a GraphQL request based on query and variables
 */
function createRequestKey(query: string, variables?: Record<string, any>): RequestKey {
  const variablesStr = variables ? JSON.stringify(variables) : ''
  return `${query}:${variablesStr}`
}

/**
 * Deduplicates GraphQL requests by returning the same Promise for identical requests
 * @param client - GraphQL client instance
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @returns Promise that resolves to the GraphQL response
 */
export async function deduplicatedRequest<T = any>(
  client: { request: (query: string, variables?: Record<string, any>) => Promise<T> },
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const requestKey = createRequestKey(query, variables)
  
  // If the same request is already in flight, return the existing Promise
  if (pendingRequests.has(requestKey)) {
    console.log(`🔄 DEDUP: Reusing in-flight request for key: ${requestKey.slice(0, 50)}...`)
    return pendingRequests.get(requestKey)!
  }
  
  // Create new request and store it
  console.log(`🚀 DEDUP: Making new request for key: ${requestKey.slice(0, 50)}...`)
  const requestPromise = client.request(query, variables)
    .finally(() => {
      // Remove from pending requests when completed (success or error)
      pendingRequests.delete(requestKey)
    })
  
  pendingRequests.set(requestKey, requestPromise)
  return requestPromise
}

/**
 * Clears all pending requests (useful for testing or manual cleanup)
 */
export function clearPendingRequests(): void {
  console.log(`🧹 DEDUP: Cleared ${pendingRequests.size} pending requests`)
  pendingRequests.clear()
}

/**
 * Gets the number of currently pending requests (useful for debugging)
 */
export function getPendingRequestCount(): number {
  return pendingRequests.size
}