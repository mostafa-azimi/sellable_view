/**
 * Customer Account Manager for 3PL filtering
 */

interface CustomerAccount {
  id: string // UUID format
  legacy_id: number
  name: string
}

export class CustomerManager {
  private static readonly STORAGE_KEY = 'selected_customer_account'

  /**
   * Save selected customer account
   */
  static saveCustomer(customer: CustomerAccount): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customer))
    console.log(`Customer selected: ${customer.name} (ID: ${customer.id})`)
  }

  /**
   * Get selected customer account
   */
  static getSelectedCustomer(): CustomerAccount | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      return JSON.parse(stored) as CustomerAccount
    } catch (error) {
      console.error('Error reading customer from storage:', error)
      return null
    }
  }

  /**
   * Get customer account ID (UUID) for API queries
   */
  static getCustomerAccountId(): string | null {
    const customer = this.getSelectedCustomer()
    return customer?.id || null
  }

  /**
   * Clear selected customer
   */
  static clearCustomer(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

