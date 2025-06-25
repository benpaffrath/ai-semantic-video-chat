import { v4 as uuidv4 } from 'uuid'

// Generate a token to identify the user
export function generateUserToken() {
    const token = uuidv4()
    localStorage.setItem('userToken', token)

    return token
}

// Get user token from local storage
export function getUserToken() {
    if (typeof window === 'undefined') return ''

    let token = localStorage.getItem('userToken')

    if (!token) {
        token = generateUserToken()
    }

    return token
}
