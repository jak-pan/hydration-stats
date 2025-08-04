// Test script to debug GraphQL queries
import { omnipoolClient, genericClient, aaveClient } from './graphql'

// Test basic connectivity and data structure
export async function testOmnipoolQuery() {
  try {
    const query = `
      query TestOmnipool {
        omnipoolAssetData(first: 5) {
          nodes {
            id
            paraBlockHeight
          }
        }
      }
    `
    console.log('Testing Omnipool query...')
    const result = await omnipoolClient.request(query)
    console.log('Omnipool result:', result)
    return result
  } catch (error) {
    console.error('Omnipool query failed:', error)
    throw error
  }
}

export async function testGenericQuery() {
  try {
    const query = `
      query TestGeneric {
        assets(first: 5) {
          nodes {
            id
            symbol
          }
        }
      }
    `
    console.log('Testing Generic query...')
    const result = await genericClient.request(query)
    console.log('Generic result:', result)
    return result
  } catch (error) {
    console.error('Generic query failed:', error)
    throw error
  }
}

export async function testAaveQuery() {
  try {
    const query = `
      query TestAave {
        aavepoolHistoricalData(first: 5) {
          nodes {
            id
            paraBlockHeight
          }
        }
      }
    `
    console.log('Testing AAVE query...')
    const result = await aaveClient.request(query)
    console.log('AAVE result:', result)
    return result
  } catch (error) {
    console.error('AAVE query failed:', error)
    throw error
  }
}