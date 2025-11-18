'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface InventoryLocation {
  binLocation: string
  quantity: number
  isPickable: boolean
  isSellable: boolean
}

interface InventoryItem {
  sku: string
  productName: string
  locations: InventoryLocation[]
}

export default function InventoryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/inventory/list')

        if (!response.ok) {
          throw new Error('Failed to fetch inventory')
        }

        const data = await response.json()
        setInventoryData(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load inventory. Please check your authentication settings.',
          variant: 'destructive',
        })
        setInventoryData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadInventory()
  }, [toast])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-balance">
            Inventory Overview
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            View all inventory levels, locations, and product availability
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground text-lg">
                Loading inventory...
              </p>
            </CardContent>
          </Card>
        ) : inventoryData.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">
                No inventory items found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {inventoryData.map((item, itemIndex) => (
              <Card key={itemIndex}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5" />
                    Inventory Locations
                  </h3>
                  {item.locations.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">
                      No inventory locations found for this product
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {item.locations.map((location, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Bin Location</p>
                              <p className="font-mono font-semibold text-lg">{location.binLocation}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                              <p className="font-semibold text-lg">{location.quantity}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge 
                              variant={location.isPickable ? 'default' : 'secondary'}
                              className="text-sm px-3 py-1"
                            >
                              {location.isPickable ? '✓ Pickable' : '✗ Not Pickable'}
                            </Badge>
                            <Badge 
                              variant={location.isSellable ? 'default' : 'secondary'}
                              className="text-sm px-3 py-1"
                            >
                              {location.isSellable ? '✓ Sellable' : '✗ Not Sellable'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
