import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // ShipHero GraphQL endpoint
    const response = await fetch('https://public-api.shiphero.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation {
            generateAccessToken(
              input: {
                refresh_token: "${refreshToken}"
              }
            ) {
              access_token
              errors {
                message
              }
            }
          }
        `,
      }),
    })

    const data = await response.json()

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0]?.message || 'Failed to generate token' },
        { status: 400 }
      )
    }

    const result = data.data.generateAccessToken

    if (result.errors && result.errors.length > 0) {
      return NextResponse.json(
        { error: result.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      accessToken: result.access_token,
    })
  } catch (error) {
    console.error('[v0] Error generating auth token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
