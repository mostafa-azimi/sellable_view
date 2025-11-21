import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shiphero/customers
 * Get all customer accounts for 3PL user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    console.log('=== CUSTOMERS API CALLED ===')
    console.log('Auth header:', authHeader ? 'Present' : 'MISSING')
    console.log('Access token:', accessToken ? accessToken.substring(0, 30) + '...' : 'MISSING')

    if (!accessToken) {
      console.error('❌ No access token provided')
      return NextResponse.json({
        success: false,
        error: "Authorization header missing",
      }, { status: 401 });
    }

    // Simplified query - just return hardcoded customer for now
    // We'll query ShipHero once we verify the endpoint works
    console.log('✅ Returning hardcoded customer for testing')
    
    const customers = [
      {
        id: 'Q3VzdG9tZXJBY2NvdW50Ojg4Nzc0', // Base64 encoded "CustomerAccount:88774"
        legacy_id: 88774,
        name: 'Donni. HQ'
      }
    ]

    console.log('📦 Customers:', customers)

    return NextResponse.json({
      success: true,
      data: customers,
      meta: {
        request_id: 'test-request',
        complexity: 1,
      },
    });
  } catch (error: any) {
    console.error("❌ Customer accounts error:", error);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch customer accounts",
        type: error.type || "unknown",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

