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

    // Correct query per ShipHero docs: warehouse_products without pagination, with customer_account_id
    const query = `
      query GetWarehouseProducts($customer_account_id: String) {
        warehouse_products(
          customer_account_id: $customer_account_id
          active: true
        ) {
          request_id
          complexity
          data {
            edges {
              node {
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
                  location {
                    id
                    name
                  }
                  quantity
                  pickable
                }
              }
            }
          }
        }
      }
    `;

    const variables = { customer_account_id: customerAccountId }

    console.log('📤 Query:', variables)

    const response = await fetch('https://public-api.shiphero.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query, variables })
    });

    console.log('📥 Status:', response.status)

    if (!response.ok) {
      const text = await response.text()
      console.error('HTTP error:', text.substring(0, 300))
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

    const products = result.data?.warehouse_products?.data?.edges?.map(({ node }: any) => node) || []
    console.log(`✅ Products: ${products.length}`)

    // Transform to flat items
    const items: any[] = []

    products.forEach((product: any) => {
      if (product.locations && product.locations.length > 0) {
        // Dynamic slotting with locations
        product.locations.forEach((loc: any) => {
          if (loc.quantity > 0) {
            items.push({
              sku: product.sku,
              productName: product.product?.name || product.sku,
              quantity: loc.quantity,
              location: loc.location?.name || 'Unknown',
              locationId: loc.location?.id || 'unknown',
              pickable: loc.pickable,
              sellable: true,
              warehouse: product.warehouse_identifier,
              barcode: product.product?.barcode,
            })
          }
        })
      } else if (product.on_hand > 0) {
        // No specific locations
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

    console.log(`🎉 Items: ${items.length}`)

    return NextResponse.json({
      success: true,
      data: items,
      meta: { total: items.length },
    });
  } catch (error: any) {
    console.error("💥 Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
