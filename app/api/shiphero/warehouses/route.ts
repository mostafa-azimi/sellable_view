import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    const searchParams = request.nextUrl.searchParams
    const customerAccountId = searchParams.get("customer_account_id")

    console.log('=== WAREHOUSES API ===')
    console.log('Auth:', accessToken ? accessToken.substring(0, 30) + '...' : 'MISSING')
    console.log('Customer filter:', customerAccountId || 'All')

    if (!accessToken) {
      console.error('❌ No token')
      return NextResponse.json({ success: false, error: "Auth required" }, { status: 401 });
    }

    const query = `
      query {
        account {
          request_id
          complexity
          data {
            warehouses {
              id
              legacy_id
              identifier
              address {
                name
                city
                state
              }
            }
          }
        }
      }
    `;

    console.log('📤 Calling ShipHero API...')

    const response = await fetch('https://public-api.shiphero.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query })
    });

    console.log('📥 Status:', response.status);

    const text = await response.text();
    console.log('Response:', text.substring(0, 300));

    if (!response.ok) {
      console.error('❌ HTTP error:', response.status);
      return NextResponse.json({ success: false, error: `HTTP ${response.status}`, details: text }, { status: 500 });
    }

    const result = JSON.parse(text);

    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      return NextResponse.json({ success: false, error: result.errors[0].message, graphql_errors: result.errors }, { status: 500 });
    }

    if (!result.data?.account?.data?.warehouses) {
      console.error('❌ No warehouse data');
      return NextResponse.json({ success: false, error: 'No warehouse data' }, { status: 500 });
    }

    console.log('✅ Success:', result.data.account.data.warehouses.length, 'warehouses');

    return NextResponse.json({
      success: true,
      data: result.data.account.data.warehouses,
      meta: {
        request_id: result.data.account.request_id,
        complexity: result.data.account.complexity,
      },
    });
  } catch (error: any) {
    console.error("💥 Exception:", error.message);
    console.error("Stack:", error.stack);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
