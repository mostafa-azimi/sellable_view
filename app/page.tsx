import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, BarChart3, Activity } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your 3PL inventory management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active SKUs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Units</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Query bin locations and manage stock levels
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Search and view all bin locations with their inventory, including SKUs, quantities, and pickable/sellable status.
            </p>
            <Link href="/inventory">
              <Button className="w-full">
                Open Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>ShipHero Integration</CardTitle>
                <CardDescription>
                  Real-time data via GraphQL API
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connected to ShipHero's GraphQL API with automatic token refresh and pagination for large datasets.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 dark:text-green-400">Connected</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            🚀 Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              1. Go to <strong>Authentication</strong> to set up your ShipHero API token
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              2. Navigate to <strong>Inventory</strong> to query bin locations by customer account ID
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              3. View real-time inventory data with automatic pagination
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
