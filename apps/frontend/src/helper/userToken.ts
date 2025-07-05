import { v4 as uuidv4 } from 'uuid'

/**
 * Generates a unique user token for anonymous user identification
 * Stores token in localStorage for persistence across browser sessions
 */
export function generateUserToken() {
    const token = uuidv4()
    localStorage.setItem('userToken', token)

    return token
}

/**
 * Retrieves or creates user token for session persistence
 * Handles SSR by checking window object availability
 */
export function getUserToken() {
    // Check for SSR environment where localStorage is not available
    if (typeof window === 'undefined') return ''

    let token = localStorage.getItem('userToken')

    // Auto-generate token if none exists for seamless user experience
    if (!token) {
        token = generateUserToken()
    }

    return token
}
