/**
 * Client-side authentication manager for ShipHero access tokens
 */

interface StoredAuth {
  accessToken: string
  expiresAt: number
  refreshToken?: string
}

export class AuthManager {
  private static readonly STORAGE_KEY = 'shiphero_auth'

  /**
   * Save authentication data to localStorage
   */
  static saveAuth(accessToken: string, expiresIn: number, refreshToken?: string): void {
    const expiresAt = Date.now() + (expiresIn * 1000) // Convert seconds to milliseconds
    
    const authData: StoredAuth = {
      accessToken,
      expiresAt,
      refreshToken
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData))
    console.log(`Auth saved, expires: ${new Date(expiresAt).toISOString()}`)
  }

  /**
   * Get valid access token from localStorage
   */
  static getValidToken(): string | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const authData: StoredAuth = JSON.parse(stored)
      
      // Check if token is still valid (with 5 minute buffer)
      if (Date.now() >= (authData.expiresAt - 300000)) {
        console.log('Token expired, clearing storage')
        this.clearAuth()
        return null
      }

      return authData.accessToken
    } catch (error) {
      console.error('Error reading auth from storage:', error)
      this.clearAuth()
      return null
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return this.getValidToken() !== null
  }

  /**
   * Clear authentication data
   */
  static clearAuth(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Get time remaining until token expires
   */
  static getTimeRemaining(): string | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const authData: StoredAuth = JSON.parse(stored)
      const remaining = authData.expiresAt - Date.now()
      
      if (remaining <= 0) return null

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`
      } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`
      } else {
        const minutes = Math.floor(remaining / (1000 * 60))
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Get stored refresh token if available
   */
  static getRefreshToken(): string | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const authData: StoredAuth = JSON.parse(stored)
      return authData.refreshToken || null
    } catch (error) {
      return null
    }
  }
}
