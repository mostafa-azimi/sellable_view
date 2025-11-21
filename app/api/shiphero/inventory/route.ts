import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shiphero/inventory
 * Get inventory with bin locations for dynamic slotting warehouse
 * Filtered by customer account ID for 3PL operations
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    const searchParams = request.nextUrl.searchParams
    const customerAccountId = searchParams.get("customer_account_id")

    console.log('=== INVENTORY API (Dynamic Slotting) ===')
    console.log('Auth token:', accessToken ? accessToken.substring(0, 30) + '...' : 'MISSING')
    console.log('Customer account ID (UUID):', customerAccountId || 'NOT PROVIDED')

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Auth required" }, { status: 401 });
    }

    if (!customerAccountId) {
      return NextResponse.json({ 
        success: false, 
        error: "customer_account_id required for 3PL operations" 
      }, { status: 400 });
    }

    // Query warehouse_products with customer_account_id for 3PL filtering
    // For dynamic slotting, products have 'locations' array with bin details
    const query = `
      query GetInventory($customer_account_id: String, $first: Int, $after: String) {
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
                id
                sku
                warehouse_id
                warehouse_identifier
                on_hand
                inventory_bin
                active
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
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    console.log('📤 Fetching inventory for customer:', customerAccountId)

    const allProducts: any[] = []
    let hasNextPage = true
    let afterCursor: string | undefined = undefined
    let pageCount = 0
    const maxPages = 20

    while (hasNextPage && pageCount < maxPages) {
      pageCount++
      
      const variables = {
        customer_account_id: customerAccountId,
        first: 100,
        after: afterCursor
      }

      console.log(`📄 Page ${pageCount}, variables:`, JSON.stringify(variables))

      const response = await fetch('https://public-api.shiphero.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ query, variables })
      });

      console.log(`📥 Page ${pageCount} response:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ ShipHero error:', errorText)
        return NextResponse.json({ 
          success: false, 
          error: `ShipHero API ${response.status}`,
          details: errorText.substring(0, 200)
        }, { status: 500 });
      }

      const result = await response.json()

      if (result.errors) {
        console.error('❌ GraphQL errors:', result.errors)
        return NextResponse.json({ 
          success: false, 
          error: result.errors[0].message,
          graphql_errors: result.errors
        }, { status: 500 });
      }

      const edges = result.data?.warehouse_products?.data?.edges || []
      console.log(`✅ Page ${pageCount}: ${edges.length} products`)
      
      allProducts.push(...edges.map(({ node }: any) => node))

      hasNextPage = result.data?.warehouse_products?.data?.pageInfo?.hasNextPage || false
      afterCursor = result.data?.warehouse_products?.data?.pageInfo?.endCursor

      // Small delay between pages
      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    console.log(`🎉 Total products fetched: ${allProducts.length}`)

    // Transform to flat inventory items
    const inventoryItems: any[] = []

    allProducts.forEach(product => {
      if (product.locations && product.locations.length > 0) {
        // Dynamic slotting - use locations array
        product.locations.forEach((location: any) => {
          if (location.quantity > 0) {
            inventoryItems.push({
              sku: product.sku,
              productName: product.product?.name || product.sku,
              quantity: location.quantity,
              location: location.location_name,
              locationId: location.location_id,
              pickable: location.pickable,
              sellable: true, // Items in locations are sellable
              warehouse: product.warehouse_identifier,
              barcode: product.product?.barcode,
            })
          }
        })
      } else if (product.inventory_bin && product.on_hand > 0) {
        // Static slotting fallback - use inventory_bin
        inventoryItems.push({
          sku: product.sku,
          productName: product.product?.name || product.sku,
          quantity: product.on_hand,
          location: product.inventory_bin,
          locationId: product.inventory_bin,
          pickable: product.active !== false,
          sellable: product.active !== false,
          warehouse: product.warehouse_identifier,
          barcode: product.product?.barcode,
        })
      }
    })

    console.log(`📦 Inventory items created: ${inventoryItems.length}`)

    return NextResponse.json({
      success: true,
      data: inventoryItems,
      meta: {
        total_items: inventoryItems.length,
        customer_account_id: customerAccountId,
        pages_fetched: pageCount,
      },
    });
  } catch (error: any) {
    console.error("💥 Inventory API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

