'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, ShieldCheck, Key } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Authentication
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up your ShipHero API credentials to access inventory data
        </p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">ShipHero API Setup</CardTitle>
                <CardDescription>
                  Configure your 3PL developer credentials
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Developer Token Ready
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your 3PL developer refresh token is pre-configured for testing
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Generate Access Token
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Use the Quick Test Token to generate a 28-day access token
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    Query Customer Data
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Enter customer account IDs to view their specific inventory
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/settings" className="flex-1">
                <Button className="w-full" size="lg">
                  <Key className="w-4 h-4 mr-2" />
                  Configure API Token
                </Button>
              </Link>
              <Link href="/inventory" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Go to Inventory
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Dev Token:</strong> dYbj7j9dspqoxwAtW5S2TOBNacIYvv7BKFwQqbArw7mv-
                </p>
                <p>
                  <strong>API Endpoint:</strong> https://public-api.shiphero.com/graphql
                </p>
                <p>
                  <strong>Features:</strong> Pagination, 3PL filtering, automatic retry logic
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
