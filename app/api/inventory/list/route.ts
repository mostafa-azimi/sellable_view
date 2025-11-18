import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from localStorage (client will need to pass this)
    // For now, we'll check cookies or you can modify to get from header
    const authToken = request.cookies.get('shiphero_auth_token')?.value
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required. Please set up your token in Settings.' },
        { status: 401 }
      )
    }

    // ShipHero GraphQL query to get all products with inventory
    const response = await fetch('https://public-api.shiphero.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        query: `
          query {
            products(first: 50) {
              edges {
                node {
                  sku
                  name
                  inventory {
                    bin_location
                    quantity
                    is_pickable
                    is_sellable
                  }
                }
              }
            }
          }
        `,
      }),
    })

    const data = await response.json()

    if (data.errors) {
      console.error('[v0] ShipHero API error:', data.errors)
      return NextResponse.json(
        { error: data.errors[0]?.message || 'Failed to fetch inventory' },
        { status: 400 }
      )
    }

    // Transform the data to match our interface
    const inventoryData = data.data.products.edges.map((edge: any) => ({
      sku: edge.node.sku,
      productName: edge.node.name,
      locations: edge.node.inventory.map((inv: any) => ({
        binLocation: inv.bin_location,
        quantity: inv.quantity,
        isPickable: inv.is_pickable,
        isSellable: inv.is_sellable,
      })),
    }))

    return NextResponse.json(inventoryData)
  } catch (error) {
    console.error('[v0] Error loading inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
