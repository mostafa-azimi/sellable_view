'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, Key, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const [refreshToken, setRefreshToken] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedRefresh, setCopiedRefresh] = useState(false)
  const [copiedAuth, setCopiedAuth] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved refresh token from localStorage
    const saved = localStorage.getItem('shiphero_refresh_token')
    if (saved) {
      setRefreshToken(saved)
    }
  }, [])

  const handleSaveRefreshToken = () => {
    localStorage.setItem('shiphero_refresh_token', refreshToken)
    toast({
      title: 'Refresh token saved',
      description: 'Your refresh token has been stored locally',
    })
  }

  const handleGenerateAuthToken = async () => {
    if (!refreshToken) {
      toast({
        title: 'Error',
        description: 'Please enter a refresh token first',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      // Call ShipHero API to generate auth token
      const response = await fetch('/api/auth/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate token')
      }

      const data = await response.json()
      setAuthToken(data.accessToken)
      
      toast({
        title: 'Auth token generated',
        description: 'Successfully generated new authentication token',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate auth token. Please check your refresh token.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'refresh' | 'auth') => {
    await navigator.clipboard.writeText(text)
    if (type === 'refresh') {
      setCopiedRefresh(true)
      setTimeout(() => setCopiedRefresh(false), 2000)
    } else {
      setCopiedAuth(true)
      setTimeout(() => setCopiedAuth(false), 2000)
    }
    toast({
      title: 'Copied to clipboard',
      description: `${type === 'refresh' ? 'Refresh' : 'Auth'} token copied`,
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-balance">
            Authentication Settings
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            Configure your ShipHero API credentials for accessing inventory data
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Key className="w-6 h-6 mt-1" />
                <div>
                  <CardTitle className="text-2xl mb-2">Developer Refresh Token</CardTitle>
                  <CardDescription className="text-base">
                    Enter your ShipHero developer refresh token. This will be saved locally for easy access during development.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refresh-token">Refresh Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="refresh-token"
                    type="password"
                    placeholder="Enter your refresh token"
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    className="font-mono"
                  />
                  {refreshToken && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(refreshToken, 'refresh')}
                    >
                      {copiedRefresh ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <Button onClick={handleSaveRefreshToken} disabled={!refreshToken}>
                Save Refresh Token
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl mb-2">Generate Auth Token</CardTitle>
              <CardDescription className="text-base">
                Use your refresh token to generate a temporary authentication token for API requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGenerateAuthToken} 
                disabled={!refreshToken || isGenerating}
                size="lg"
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Auth Token'}
              </Button>

              {authToken && (
                <div className="space-y-2">
                  <Label htmlFor="auth-token">Generated Auth Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="auth-token"
                      type="text"
                      value={authToken}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(authToken, 'auth')}
                    >
                      {copiedAuth ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This token will expire. Generate a new one when needed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
