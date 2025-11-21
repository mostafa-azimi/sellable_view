'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Download, ArrowUpDown, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AuthManager } from '@/lib/auth-manager'

type SortField = 'warehouse' | 'location' | 'sku' | 'productName' | 'quantity' | 'zone'

interface FlatInventoryItem {
  warehouse: string
  location: string
  zone: string
  pickable: boolean
  sellable: boolean
  sku: string
  productName: string
  quantity: number
  barcode?: string
}

export default function InventoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [flatInventory, setFlatInventory] = useState<FlatInventoryItem[]>([])
  const [sortField, setSortField] = useState<SortField>('warehouse')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsAuthenticated(AuthManager.isAuthenticated())
  }, [])

  const loadInventoryDirect = async () => {
    const accessToken = AuthManager.getValidToken()
    if (!accessToken) {
      toast({
        title: 'Authentication required',
        description: 'Please authenticate in Settings first',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    
    try {
      console.log('Making direct ShipHero API call...')
      
      // Direct call to ShipHero API - bypass our server entirely
      const response = await fetch('https://public-api.shiphero.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: `
            query GetWarehouseProducts {
              warehouse_products(first: 100) {
                request_id
                complexity
                data {
                  edges {
                    node {
                      sku
                      warehouse_identifier
                      inventory_bin
                      on_hand
                      product {
                        name
                        barcode
                      }
                    }
                  }
                }
              }
            }
          `
        })
      })

      console.log('ShipHero response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ShipHero error:', errorText)
        throw new Error(`ShipHero API error: ${response.status}`)
      }

      const result = await response.json()
      console.log('ShipHero data received:', result)

      if (result.errors) {
        console.error('GraphQL errors:', result.errors)
        throw new Error(result.errors[0].message)
      }

      // Transform data
      const flatData: FlatInventoryItem[] = result.data.warehouse_products.data.edges
        .map(({ node }: any) => ({
          warehouse: node.warehouse_identifier,
          location: node.inventory_bin || 'Unassigned',
          zone: node.inventory_bin?.split('-')[0] || 'Unknown',
          pickable: true,
          sellable: true,
          sku: node.sku,
          productName: node.product?.name || node.sku,
          quantity: node.on_hand,
          barcode: node.product?.barcode,
        }))
        .filter((item: any) => item.quantity > 0)

      setFlatInventory(flatData)
      
      toast({
        title: 'SUCCESS!',
        description: `Loaded ${flatData.length} inventory items directly from ShipHero`,
      })

    } catch (error: any) {
      console.error('Load error:', error)
      
      if (error.message?.includes('401')) {
        AuthManager.clearAuth()
        setIsAuthenticated(false)
        toast({
          title: 'Token expired',
          description: 'Please re-authenticate in Settings',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load inventory',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Warehouse', 'Location', 'Zone', 'SKU', 'Product', 'Quantity', 'Barcode']
    const csvContent = [
      headers.join(','),
      ...flatInventory.map(item => [
        item.warehouse,
        item.location,
        item.zone,
        item.sku,
        `"${item.productName}"`,
        item.quantity,
        item.barcode || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {flatInventory.length > 0 && `${flatInventory.length} items loaded`}
          </p>
        </div>
        <div className="flex gap-2">
          {flatInventory.length > 0 && (
            <Button onClick={exportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
          {isAuthenticated && (
            <Button onClick={loadInventoryDirect} disabled={isLoading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Load Inventory'}
            </Button>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-amber-600" />
            <p className="text-amber-800 text-lg mb-4">Authentication Required</p>
            <Button onClick={() => window.location.href = '/settings'}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      ) : flatInventory.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg mb-4">Ready to load inventory</p>
            <Button onClick={loadInventoryDirect} disabled={isLoading} size="lg">
              <Package className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : 'Load All Inventory'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Warehouse</th>
                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                    <th className="px-4 py-3 text-left font-semibold">SKU</th>
                    <th className="px-4 py-3 text-left font-semibold">Product</th>
                    <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {flatInventory.map((item, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{item.warehouse}</td>
                      <td className="px-4 py-3 font-mono text-sm">{item.location}</td>
                      <td className="px-4 py-3 font-mono font-semibold">{item.sku}</td>
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3 font-semibold text-lg">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
