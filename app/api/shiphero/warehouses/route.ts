import { NextRequest, NextResponse } from "next/server";
import { getShipHeroClient, getCustomerAccountId } from "@/lib/shiphero";
import type { QueryResult, Warehouse } from "@/lib/shiphero/types";

/**
 * GET /api/shiphero/warehouses
 * Retrieve all warehouses for the account
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header (client-side auth)
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: "Authorization header with access token required",
        hint: "Include 'Authorization: Bearer {token}' header"
      }, { status: 401 });
    }

    console.log('Using client-provided access token for warehouses query');

    // Direct API call using client-provided token
    const query = `
      query GetWarehouses {
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
                address1
                city
                state
                country
                zip
              }
            }
          }
        }
      }
    `;

    console.log('Fetching warehouses with client token...');

    const response = await fetch('https://public-api.shiphero.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    if (!result.data?.account?.data) {
      throw new Error('No account data returned');
    }

    console.log('Warehouses fetched successfully:', result.data.account.data.warehouses.length);

    return NextResponse.json({
      success: true,
      data: result.data.account.data.warehouses,
      meta: {
        request_id: result.data.account.request_id,
        complexity: result.data.account.complexity,
        auth_method: 'client_token'
      },
    });
  } catch (error: any) {
    console.error("Warehouses fetch error:", error);
    
    // More detailed error handling
    let errorMessage = error.message || "Failed to fetch warehouses";
    let hint = "Check your ShipHero API credentials";
    
    if (error.message?.includes('token') || error.message?.includes('Authentication')) {
      errorMessage = "Authentication failed";
      hint = "Check your SHIPHERO_REFRESH_TOKEN environment variable";
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      hint = "Check network connectivity to ShipHero API";
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        type: error.type || 'unknown',
        hint: hint,
        debug: {
          refresh_token_set: !!process.env.SHIPHERO_REFRESH_TOKEN,
          customer_account_id: process.env.SHIPHERO_CUSTOMER_ACCOUNT_ID || 'Not set'
        }
      },
      { status: 500 }
    );
  }
}

