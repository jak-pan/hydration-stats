// Debug helper to test GraphQL endpoints
import { omnipoolClient, genericClient, aaveClient } from './graphql'

// Most basic queries to test connectivity
export async function testBasicQueries() {
  console.log('=== Testing Basic Connectivity ===')
  
  // Test 1: Basic Omnipool query
  try {
    const omnipoolTest = await omnipoolClient.request(`
      query {
        omnipoolAssetData(first: 1) {
          nodes {
            id
          }
        }
      }
    `)
    console.log('✅ Omnipool endpoint working:', omnipoolTest)
  } catch (err) {
    console.log('❌ Omnipool endpoint failed:', err)
  }

  // Test 2: Basic Generic query
  try {
    const genericTest = await genericClient.request(`
      query {
        assets(first: 1) {
          nodes {
            id
          }
        }
      }
    `)
    console.log('✅ Generic endpoint working:', genericTest)
  } catch (err) {
    console.log('❌ Generic endpoint failed:', err)
  }

  // Test 3: Basic AAVE query
  try {
    const aaveTest = await aaveClient.request(`
      query {
        aavepoolHistoricalData(first: 1) {
          nodes {
            id
          }
        }
      }
    `)
    console.log('✅ AAVE endpoint working:', aaveTest)
  } catch (err) {
    console.log('❌ AAVE endpoint failed:', err)
  }
}

// Test schema introspection
export async function testIntrospection() {
  console.log('=== Testing Schema Introspection ===')
  
  try {
    const schema = await omnipoolClient.request(`
      query {
        __schema {
          types {
            name
            fields {
              name
            }
          }
        }
      }
    `)
    
    const omnipoolType = schema.__schema.types.find((t: any) => 
      t.name === 'OmnipoolAssetDatum' || t.name === 'OmnipoolAssetData'
    )
    console.log('Omnipool type found:', omnipoolType)
    
  } catch (err) {
    console.log('Schema introspection failed:', err)
  }
}