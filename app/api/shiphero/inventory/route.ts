import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    const searchParams = request.nextUrl.searchParams
    const customerAccountId = searchParams.get("customer_account_id")

    console.log('=== INVENTORY API ===')
    console.log('Token:', accessToken ? 'OK' : 'MISSING')
    console.log('Customer ID:', customerAccountId)

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Auth required" }, { status: 401 });
    }

    if (!customerAccountId) {
      return NextResponse.json({ success: false, error: "customer_account_id required" }, { status: 400 });
    }

    // CORRECT query: warehouse_products with customer_account_id
    const query = `
      query ($customer_account_id: String, $first: Int, $after: String) {
        warehouse_products(
          customer_account_id: $customer_account_id
          active: true
          first: $first
          after: $after
        ) {
          request_id
          complexity
          data {
            edges {
              node {
                sku
                warehouse_identifier
                on_hand
                inventory_bin
                product {
                  name
                  barcode
                }
                locations {
                  location_id
                  location_name
                  quantity
                  pickable
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    console.log('📤 Querying ShipHero...')

    const allProducts: any[] = []
    let hasNextPage = true
    let afterCursor: string | undefined = undefined
    let pageCount = 0

    while (hasNextPage && pageCount < 10) {
      pageCount++
      
      const variables = {
        customer_account_id: customerAccountId,
        first: 100,
        after: afterCursor
      }

      const response = await fetch('https://public-api.shiphero.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ query, variables })
      });

      console.log(`Page ${pageCount}:`, response.status)

      if (!response.ok) {
        const text = await response.text()
        console.error('HTTP error:', text.substring(0, 200))
        return NextResponse.json({ 
          success: false, 
          error: `HTTP ${response.status}`,
          details: text.substring(0, 300)
        }, { status: 500 });
      }

      const result = await response.json()

      if (result.errors) {
        console.error('GraphQL errors:', JSON.stringify(result.errors))
        return NextResponse.json({ 
          success: false, 
          error: result.errors[0].message,
          errors: result.errors
        }, { status: 500 });
      }

      const edges = result.data?.warehouse_products?.data?.edges || []
      console.log(`Page ${pageCount}: ${edges.length} items`)
      
      allProducts.push(...edges.map(({ node }: any) => node))

      hasNextPage = result.data?.warehouse_products?.data?.pageInfo?.hasNextPage || false
      afterCursor = result.data?.warehouse_products?.data?.pageInfo?.endCursor

      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    console.log(`Total: ${allProducts.length} products`)

    // Transform to inventory items
    const items: any[] = []

    allProducts.forEach(product => {
      if (product.locations && product.locations.length > 0) {
        // Dynamic slotting
        product.locations.forEach((loc: any) => {
          if (loc.quantity > 0) {
            items.push({
              sku: product.sku,
              productName: product.product?.name || product.sku,
              quantity: loc.quantity,
              location: loc.location_name,
              locationId: loc.location_id,
              pickable: loc.pickable,
              sellable: true,
              warehouse: product.warehouse_identifier,
              barcode: product.product?.barcode,
            })
          }
        })
      } else if (product.on_hand > 0) {
        // Static or no locations
        items.push({
          sku: product.sku,
          productName: product.product?.name || product.sku,
          quantity: product.on_hand,
          location: product.inventory_bin || 'General',
          locationId: product.inventory_bin || 'general',
          pickable: true,
          sellable: true,
          warehouse: product.warehouse_identifier,
          barcode: product.product?.barcode,
        })
      }
    })

    console.log(`✅ Items: ${items.length}`)

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        total: items.length,
        pages: pageCount
      },
    });
  } catch (error: any) {
    console.error("💥 Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
