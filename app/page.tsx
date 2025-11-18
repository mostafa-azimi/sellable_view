import Link from 'next/link'
import { Package, Key, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-balance">
            Customer Inventory Portal
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            View real-time inventory levels, product locations, and stock availability
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">View Inventory</CardTitle>
                <CardDescription className="text-base">
                  Search by SKU or product name to view locations, quantities, and availability status
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/inventory">
                <Button className="w-full" size="lg">
                  Search Inventory
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Product Details</CardTitle>
                <CardDescription className="text-base">
                  View comprehensive product information including bin locations and stock status
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/inventory">
                <Button className="w-full" size="lg">
                  View Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="border-t pt-12">
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Key className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-foreground">Settings & Configuration</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/settings">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Key className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <CardTitle className="text-lg mb-1">Authentication</CardTitle>
                      <CardDescription>
                        Manage ShipHero API tokens and authentication
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Card className="opacity-50">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Package className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <CardTitle className="text-lg mb-1">API Status</CardTitle>
                    <CardDescription>
                      View connection status and API health
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
