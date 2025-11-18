import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Get auth token from header or you can retrieve from storage
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // ShipHero GraphQL query for inventory
    const response = await fetch('https://public-api.shiphero.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        query: `
          query {
            products(sku: "${query}") {
              data {
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
        `,
      }),
    })

    const data = await response.json()

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0]?.message || 'Failed to fetch inventory' },
        { status: 400 }
      )
    }

    const product = data.data.products.data[0]

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform the data to match our interface
    const inventoryData = {
      sku: product.sku,
      productName: product.name,
      locations: product.inventory.map((inv: any) => ({
        binLocation: inv.bin_location,
        quantity: inv.quantity,
        isPickable: inv.is_pickable,
        isSellable: inv.is_sellable,
      })),
    }

    return NextResponse.json(inventoryData)
  } catch (error) {
    console.error('[v0] Error searching inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
