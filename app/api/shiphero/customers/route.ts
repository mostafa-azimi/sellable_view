import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shiphero/customers
 * Get all customer accounts for 3PL user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: "Authorization header missing",
      }, { status: 401 });
    }

    console.log('Fetching customer accounts for 3PL user...')

    // Query to get customer accounts (per ShipHero docs for 3PL)
    const query = `
      query GetCustomerAccounts {
        account {
          request_id
          complexity
          data {
            customers {
              edges {
                node {
                  id
                  legacy_id
                  name
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://public-api.shiphero.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ShipHero API error:', errorText)
      throw new Error(`ShipHero API error ${response.status}`)
    }

    const result = await response.json()
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      throw new Error(result.errors[0].message)
    }

    if (!result.data?.account?.data?.customers) {
      throw new Error('No customer accounts found')
    }

    const customers = result.data.account.data.customers.edges.map(({ node }: any) => ({
      id: node.id, // UUID format
      legacy_id: node.legacy_id,
      name: node.name,
    }))

    console.log('Customer accounts fetched:', customers.length)

    return NextResponse.json({
      success: true,
      data: customers,
      meta: {
        request_id: result.data.account.request_id,
        complexity: result.data.account.complexity,
      },
    });
  } catch (error: any) {
    console.error("Customer accounts fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch customer accounts",
        type: error.type || "unknown",
      },
      { status: 500 }
    );
  }
}

