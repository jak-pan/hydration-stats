import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Asset, 
  AavepoolHistoricalData, 
  OmnipoolAssetData, 
  TVLData, 
  VolumeData, 
  AssetComposition,
  StableswapPoolData,
  XYKPoolData,
  HistoricalTVLData
} from '@/types'
import { 
  aaveClient, 
  omnipoolClient, 
  genericClient,
  GET_ASSETS, 
  GET_ALL_ASSETS,
  GET_AAVE_POOLS, 
  GET_OMNIPOOL_DATA,
  GET_ASSETS_BY_IDS,
  GET_EMA_ORACLES,
  EXPLORE_PRICE_DATA,
  GET_BLOCKS_WITH_TIMESTAMPS,
  GET_OMNIPOOL_WITH_ASSET_STATE,
  INTROSPECT_OMNIPOOL,
  INTROSPECT_ASSET,
  INTROSPECT_EMA,
  EXPLORE_PRICE_SCHEMA,
  GET_LATEST_BLOCK,
  GET_ASSETS_FROM_BLOCK,
  GET_OMNIPOOL_FROM_BLOCK,
  GET_STABLEPOOLS_FROM_BLOCK,
  GET_XYK_POOLS_FROM_BLOCK,
  INTROSPECT_OMNIPOOL_HISTORICAL,
  GET_ASSET_SPOT_PRICES,
  GET_LATEST_ASSET_PRICES,
  GET_HISTORICAL_TVL_DATA,
  GET_OMNIPOOL_HISTORICAL_BY_BLOCKS,
  GET_STABLEPOOLS_HISTORICAL_BY_BLOCKS,
  GET_XYK_HISTORICAL_BY_BLOCKS,
  GET_AAVE_HISTORICAL_BY_BLOCKS
} from '@/utils/graphql'

export const useDataStore = defineStore('data', () => {
  // State
  const assets = ref<Asset[]>([])
  const aavePools = ref<AavepoolHistoricalData[]>([])
  const omnipoolData = ref<OmnipoolAssetData[]>([])
  const showH2O = ref<boolean>(false)
  const stablepoolData = ref<StableswapPoolData[]>([])
  const xykPoolData = ref<XYKPoolData[]>([])
  const loading = ref(false)
  const historicalDataLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const latestBlockInfo = ref<{ 
    paraBlock: number, 
    relayBlock?: number, 
    timestamp?: Date 
  } | null>(null)
  const priceData = ref<{ [assetId: string]: number }>({}) // Store USD prices by asset ID
  const historicalTVLDataAll = ref<HistoricalTVLData[]>([])
  const historicalTVLDataNoH2O = ref<HistoricalTVLData[]>([])
  const historicalAssetDataAll = ref<{ [assetId: string]: number[] }>({})
  const historicalAssetDataNoH2O = ref<{ [assetId: string]: number[] }>({})
  
  // Cache for different time periods
  const historicalDataCache = ref<{
    [period: string]: {
      tvlData: HistoricalTVLData[]
      assetData: { [assetId: string]: number[] }
      timestamp: number
    }
  }>({})

  // Helper function to extract balance from the complex balances object
  function extractBalance(balances: any, decimals: number = 12, assetId?: string): number {
    if (!balances) return 0
    
    // The balances are stored in a minified format as described in the docs:
    // AccountBalances: {t: "AccountBalances", d: [free, reserved, miscFrozen, feeFrozen, frozen, flags]}
    if (balances.t === "AccountBalances" && balances.d && Array.isArray(balances.d)) {
      const [free, reserved] = balances.d
      const freeBalance = parseFloat(free || '0')
      const reservedBalance = parseFloat(reserved || '0')
      const totalBalance = freeBalance + reservedBalance
      
      // Normalize by decimals to get the actual token amount
      const normalizedBalance = totalBalance / Math.pow(10, decimals)
      
      console.log(`Asset ${assetId}: ${totalBalance} raw, ${normalizedBalance} normalized tokens`)
      
      // Return token amount (we'll apply USD conversion in computed properties)
      return normalizedBalance
    }
    
    console.log('Unknown balance structure:', balances)
    return 0
  }

  // Helper function to convert token amount to USD
  function getUsdValue(tokenAmount: number, assetId: string): number {
    const price = priceData.value[assetId]
    if (price) {
      return tokenAmount * price
    }
    // Return 0 if no price available rather than using mock prices
    return 0
  }

  // Computed
  const tvlData = computed<TVLData>(() => {
    // Calculate TVL from various sources
    let omnipoolTvlTokens = 0
    let omnipoolTvlUsd = 0
    
    omnipoolData.value.forEach(pool => {
      const assetIdStr = String(pool.assetId)
      
      // Skip H2O asset (ID: 1) if showH2O is false
      if (!showH2O.value && assetIdStr === '1') {
        console.log(`TVL calc - Skipping H2O asset (ID: 1) as showH2O is false`)
        return
      }
      
      const asset = assets.value.find(a => a.id === assetIdStr)
      const decimals = asset?.decimals || 12
      
      const tokenBalance = extractBalance(pool.balances, decimals, assetIdStr)
      const usdValue = getUsdValue(tokenBalance, assetIdStr)
      
      omnipoolTvlTokens += tokenBalance
      omnipoolTvlUsd += usdValue
    })

    const moneyMarketTvl = aavePools.value.reduce((sum, pool) => {
      const tvl = pool.tvlInRefAssetNorm ? parseFloat(pool.tvlInRefAssetNorm) : 0
      return sum + (isNaN(tvl) ? 0 : tvl)
    }, 0)
    
    // Calculate Stablepool TVL
    let stablepoolTvl = 0
    stablepoolData.value.forEach(pool => {
      const tvl = parseFloat(pool.tvlTotalInRefAssetNorm || '0')
      stablepoolTvl += isNaN(tvl) ? 0 : tvl
    })
    
    // Calculate XYK TVL
    let xykTvl = 0
    if (xykPoolData.value && Array.isArray(xykPoolData.value)) {
      xykPoolData.value.forEach(pool => {
        if (pool && pool.tvlInRefAssetNorm) {
          const tvl = parseFloat(pool.tvlInRefAssetNorm || '0')
          xykTvl += isNaN(tvl) ? 0 : tvl
        }
      })
    }

    const tvlSummary = {
      omnipool: { tokens: omnipoolTvlTokens.toFixed(2), usd: omnipoolTvlUsd.toFixed(2) },
      stablepool: { usd: stablepoolTvl.toFixed(2), pools: stablepoolData.value.length },
      xyk: { usd: xykTvl.toFixed(2), pools: xykPoolData.value?.length || 0 },
      moneyMarket: { usd: moneyMarketTvl.toFixed(2) }
    }
    console.log('TVL Summary:', tvlSummary)

    return {
      total: omnipoolTvlUsd + stablepoolTvl + xykTvl + moneyMarketTvl, // Return USD total
      totalTokens: omnipoolTvlTokens, // Also provide token total
      omnipool: omnipoolTvlUsd, // Return USD for omnipool
      omnipoolTokens: omnipoolTvlTokens, // Also provide token total
      xyk: xykTvl,
      stableswap: stablepoolTvl,
      moneyMarket: moneyMarketTvl
    }
  })

  // Computed properties to return appropriate data based on H2O toggle
  const historicalTVLData = computed(() => {
    return showH2O.value ? historicalTVLDataAll.value : historicalTVLDataNoH2O.value
  })

  const historicalAssetData = computed(() => {
    return showH2O.value ? historicalAssetDataAll.value : historicalAssetDataNoH2O.value
  })

  const assetComposition = computed<AssetComposition[]>(() => {
    const totalTvlUsd = tvlData.value.total
    if (totalTvlUsd === 0) return []

    const compositions: AssetComposition[] = []
    
    const compositionSummary = {
      omnipool: omnipoolData.value.length,
      stablepool: stablepoolData.value.length,
      xyk: xykPoolData.value?.length || 0
    }
    console.log('Asset composition summary:', compositionSummary)
    
    // Add Omnipool assets
    omnipoolData.value.forEach(pool => {
      // Convert assetId to string safely
      const assetIdStr = String(pool.assetId)
      
      // First try to find the asset in our registry
      let asset = assets.value.find(a => a.id === assetIdStr)
      
      // If not found and we have asset info from the whale indexer, use it
      if (!asset && (pool as any)._asset) {
        const whaleAsset = (pool as any)._asset
        asset = {
          id: assetIdStr,
          assetRegistryId: whaleAsset.assetRegistryId,
          name: whaleAsset.name || `Unknown Asset ${assetIdStr}`,
          symbol: whaleAsset.symbol || `UNK${assetIdStr.slice(-2)}`,
          decimals: whaleAsset.decimals || 18,
          assetType: whaleAsset.assetType,
          multiLocationsMetadata: whaleAsset.multiLocationsMetadata
        }
        
        // Also add it to the assets array for future use
        assets.value.push(asset)
        // Asset added from Omnipool data
      }
      
      // For debugging hex assets
      if (assetIdStr.startsWith('0x') && !asset) {
        // EVM asset not found after whale indexer check
      }
      
      const finalAsset = asset || {
        id: assetIdStr,
        name: `Unknown Asset ${assetIdStr}`,
        symbol: `UNK${assetIdStr.slice(-2)}`,
        decimals: 12 // We'll still need a fallback for truly unknown assets
      }
      
      const tvl = extractBalance(pool.balances, finalAsset.decimals, assetIdStr)
      const tvlUsd = getUsdValue(tvl, assetIdStr)
      
      compositions.push({
        asset: finalAsset,
        tvl,
        tvlUsd,
        percentage: totalTvlUsd > 0 ? (tvlUsd / totalTvlUsd) * 100 : 0,
        category: 'omnipool',
        poolId: 'omnipool',
        poolName: 'Omnipool'
      })
    })
    
    // Add Stablepool assets
    stablepoolData.value.forEach((pool, poolIndex) => {
      const poolName = pool.shareToken?.name || pool.shareToken?.symbol || `Pool ${pool.poolId}`
      const stableAssetResults: string[] = []
      
      pool.assets.forEach((poolAsset, assetIndex) => {
        const assetIdStr = String(poolAsset.assetId)
        
        // Find or create asset info
        let asset = assets.value.find(a => a.id === assetIdStr)
        if (!asset && poolAsset.asset) {
          asset = {
            id: assetIdStr,
            assetRegistryId: poolAsset.asset.assetRegistryId,
            name: poolAsset.asset.name || `Unknown Asset`,
            symbol: poolAsset.asset.symbol || 'UNK',
            decimals: poolAsset.asset.decimals || 18,
            assetType: poolAsset.asset.assetType,
            multiLocationsMetadata: poolAsset.asset.multiLocationsMetadata
          }
          // Add to assets array
          assets.value.push(asset)
        }
        
        const finalAsset = asset || {
          id: assetIdStr,
          name: `Unknown Asset ${assetIdStr}`,
          symbol: `UNK${assetIdStr.slice(-2)}`,
          decimals: 18
        }
        
        // Calculate TVL from freeBalance
        const tvl = parseFloat(poolAsset.freeBalance || '0') / Math.pow(10, finalAsset.decimals)
        const tvlUsd = parseFloat(poolAsset.tvlInRefAssetNorm || '0')
        
        stableAssetResults.push(`${finalAsset.symbol}: $${tvlUsd.toFixed(2)}`)
        
        compositions.push({
          asset: finalAsset,
          tvl,
          tvlUsd,
          percentage: totalTvlUsd > 0 ? (tvlUsd / totalTvlUsd) * 100 : 0,
          category: 'stablepool',
          poolId: pool.poolId,
          poolName
        })
      })
      
      if (stableAssetResults.length > 0) {
        console.log(`Stablepool ${poolIndex + 1} (${poolName}):`, stableAssetResults.join(', '))
      }
    })
    
    // Add Money Market assets
    aavePools.value.forEach((pool, poolIndex) => {
      const reserveAsset = pool.pool.reserveAsset
      const aToken = pool.pool.aToken
      
      console.log(`Processing money market pool ${poolIndex + 1}: ${reserveAsset.symbol} (${pool.pool.id})`)
      
      // Add the reserve asset (underlying asset being lent)
      let asset = assets.value.find(a => a.id === reserveAsset.id)
      if (!asset) {
        asset = {
          id: reserveAsset.id,
          assetRegistryId: (reserveAsset as any).assetRegistryId,
          name: reserveAsset.name,
          symbol: reserveAsset.symbol,
          decimals: 12, // Default for Hydration assets
          assetType: reserveAsset.assetType || 'Token',
          multiLocationsMetadata: (reserveAsset as any).multiLocationsMetadata
        }
        assets.value.push(asset)
        console.log(`  Added money market asset: ${asset.symbol}`)
      }
      
      // Calculate TVL for the reserve asset
      const tvlUsd = parseFloat(pool.tvlInRefAssetNorm || '0')
      // For token amount, we need to extract from aTokenTotalSupply
      const aTokenSupply = parseFloat(pool.aTokenTotalSupply || '0')
      const tvl = aTokenSupply / Math.pow(10, asset.decimals)
      
      console.log(`  Reserve asset: ${asset.symbol} - TVL: $${tvlUsd.toFixed(2)}, Tokens: ${tvl.toFixed(2)}`)
      
      compositions.push({
        asset,
        tvl,
        tvlUsd,
        percentage: totalTvlUsd > 0 ? (tvlUsd / totalTvlUsd) * 100 : 0,
        category: 'moneymarket',
        poolId: pool.pool.id,
        poolName: `${reserveAsset.symbol} Money Market`
      })
    })
    
    // Add XYK pool assets
    if (xykPoolData.value && Array.isArray(xykPoolData.value)) {
      xykPoolData.value.forEach((pool, poolIndex) => {
        if (!pool) return
        
        const poolName = `${pool.assetA?.symbol || 'Unknown'} / ${pool.assetB?.symbol || 'Unknown'}`
        const poolTvl = parseFloat(pool.tvlInRefAssetNorm || '0')
        
        const xykAssetResults: string[] = []
        
        // Add both assets from the pool
        const poolAssets = [pool.assetA, pool.assetB].filter(Boolean)
        poolAssets.forEach((poolAsset, assetIndex) => {
        if (!poolAsset) return
        
        const assetIdStr = String(poolAsset.id)
        const balance = assetIndex === 0 ? pool.assetABalance : pool.assetBBalance
        
        // Find or create asset info
        let asset = assets.value.find(a => a.id === assetIdStr)
        if (!asset) {
          asset = {
            id: assetIdStr,
            assetRegistryId: (poolAsset as any).assetRegistryId,
            name: poolAsset.name || `Unknown Asset`,
            symbol: poolAsset.symbol || 'UNK',
            decimals: poolAsset.decimals || 12,
            assetType: poolAsset.assetType,
            multiLocationsMetadata: (poolAsset as any).multiLocationsMetadata
          }
          assets.value.push(asset)
          console.log(`  Added XYK asset: ${asset.symbol}`)
        }
        
        // Calculate asset TVL (half of pool TVL for each asset in XYK)
        const tvlUsd = poolTvl / 2
        const tvl = parseFloat(balance || '0') / Math.pow(10, asset.decimals)
        
        xykAssetResults.push(`${asset.symbol}: $${tvlUsd.toFixed(2)}`)
        
        compositions.push({
          asset,
          tvl,
          tvlUsd,
          percentage: totalTvlUsd > 0 ? (tvlUsd / totalTvlUsd) * 100 : 0,
          category: 'xyk',
          poolId: pool.poolId,
          poolName
          })
        })
        
        if (xykAssetResults.length > 0) {
          console.log(`XYK ${poolIndex + 1} (${poolName}, $${poolTvl.toFixed(2)}):`, xykAssetResults.join(', '))
        }
      })
    }
    
    console.log(`Total compositions: ${compositions.length} (Omnipool: ${compositions.filter(c => c.category === 'omnipool').length}, Stablepool: ${compositions.filter(c => c.category === 'stablepool').length}, XYK: ${compositions.filter(c => c.category === 'xyk').length}, Money Market: ${compositions.filter(c => c.category === 'moneymarket').length})`)
    
    // Debug: Show asset types in first 5 compositions
    console.log('Asset types in compositions:', compositions.slice(0, 5).map(c => ({
      symbol: c.asset.symbol,
      assetType: c.asset.assetType,
      id: c.asset.id,
      category: c.category
    })))
    
    return compositions.sort((a, b) => b.tvlUsd - a.tvlUsd) // Sort by USD value
  })

  // Actions
  async function introspectSchemas(blockHeight?: number) {
    try {
      console.log('Introspecting schemas...')
      
      // Check EMA Oracle schema (for price data)
      try {
        const emaSchema = await genericClient.request(INTROSPECT_EMA)
        console.log('EMA Oracle schema fields:', emaSchema.__type?.fields)
      } catch (err) {
        console.log('EMA introspection failed')
      }

      // Try to get EMA Oracle data with correct schema
      try {
        const emaData = await genericClient.request(GET_EMA_ORACLES)
        console.log('EMA Oracle data (correct schema):', emaData)
        if (emaData.emaOracles?.nodes?.length > 0) {
          console.log('First EMA entry structure:', emaData.emaOracles.nodes[0])
          console.log('EMA entries sample:', emaData.emaOracles.nodes[0].entries)
        }
      } catch (err) {
        console.log('EMA data fetch failed (corrected):', err)
      }

      // Explore what price-related entities exist
      try {
        const schemaData = await genericClient.request(EXPLORE_PRICE_DATA)
        const priceRelatedTypes = schemaData.__schema.types.filter((type: any) => 
          type.name && (
            type.name.toLowerCase().includes('price') ||
            type.name.toLowerCase().includes('oracle') ||
            type.name.toLowerCase().includes('swap') ||
            type.name.toLowerCase().includes('trade')
          )
        )
        console.log('Price-related GraphQL types:', priceRelatedTypes.map((t: any) => t.name))
      } catch (err) {
        console.log('Schema exploration failed:', err)
      }

      // First introspect to see what fields are available on OmnipoolAssetHistoricalDatum
      try {
        console.log('Introspecting OmnipoolAssetHistoricalDatum fields...')
        const historicalSchema = await aaveClient.request(INTROSPECT_OMNIPOOL_HISTORICAL)
        console.log('OmnipoolAssetHistoricalDatum fields:', historicalSchema.__type?.fields)
      } catch (err) {
        console.log('OmnipoolAssetHistoricalDatum introspection failed:', err)
      }

      // Fetch USD prices from latest block only (much faster)
      try {
        let targetBlockHeight = blockHeight
        if (!targetBlockHeight) {
          console.log('Getting latest block height for price data...')
          const latestBlockData = await aaveClient.request(GET_LATEST_BLOCK)
          targetBlockHeight = latestBlockData.assetHistoricalData.nodes[0].paraBlockHeight
          console.log(`Latest block height: ${targetBlockHeight}`)
        }

        console.log(`Fetching USD prices from block ${targetBlockHeight}...`)
        const priceHistoricalData = await aaveClient.request(GET_ASSETS_FROM_BLOCK, {
          blockHeight: targetBlockHeight
        })
        console.log('Asset price data from latest block:', priceHistoricalData)
        console.log(`Fetched ${priceHistoricalData.assetHistoricalData?.nodes?.length || 0} price entries from block ${targetBlockHeight}`)
        
        if (priceHistoricalData.assetHistoricalData?.nodes?.length > 0) {
          const newPriceData: { [assetId: string]: number } = {}
          
          // Process price data - get most recent price for each asset
          // Try both assetId and assetRegistryId as keys since Omnipool might use different IDs
          priceHistoricalData.assetHistoricalData.nodes.forEach((priceNode: any) => {
            const assetId = String(priceNode.assetId)
            const assetRegistryId = String(priceNode.assetRegistryId)
            const priceUsd = parseFloat(priceNode.usdPriceNormalised || 0)
            
            if (!isNaN(priceUsd) && priceUsd > 0) {
              // For EVM assets, add the asset info if not present
              if (assetId && assetId.startsWith('0x') && priceNode.asset) {
                const existingAsset = assets.value.find(a => a.id === assetId)
                if (!existingAsset) {
                  assets.value.push({
                    id: assetId,
                    name: priceNode.asset.name || `EVM Asset`,
                    symbol: priceNode.asset.symbol || 'UNKNOWN',
                    decimals: priceNode.asset.decimals || 18,
                    assetType: 'Erc20'
                  })
                  console.log(`Added EVM asset from price data: ${priceNode.asset.symbol} (${assetId})`)
                }
              }
              
              // Use assetRegistryId as the primary key (this is likely what Omnipool uses)
              if (!newPriceData[assetRegistryId]) {
                newPriceData[assetRegistryId] = priceUsd
                console.log(`Setting price for asset registry ${assetRegistryId} (${priceNode.asset?.symbol || 'Unknown'}): $${priceUsd}`)
              }
              
              // Also try assetId as a fallback
              if (!newPriceData[assetId] && assetId !== assetRegistryId) {
                newPriceData[assetId] = priceUsd
                console.log(`Setting price for asset ${assetId} (${priceNode.asset?.symbol || 'Unknown'}): $${priceUsd}`)
              }
            }
          })
          
          // Update the price data store
          priceData.value = newPriceData
          console.log('Updated price data from latest block:', newPriceData)
          
          // Check which Omnipool assets don't have prices
          const omnipoolAssetIds = omnipoolData.value.map(pool => String(pool.assetId))
          const missingPrices = omnipoolAssetIds.filter(id => !newPriceData[id])
          console.log('Omnipool assets without USD prices:', missingPrices)
        }
      } catch (priceErr) {
        console.log('Latest block price fetch failed:', priceErr)
      }

      // Check Omnipool schema
      try {
        const omnipoolSchema = await omnipoolClient.request(INTROSPECT_OMNIPOOL)
        console.log('Omnipool schema fields:', omnipoolSchema.__type?.fields)
      } catch (err) {
        console.log('Omnipool introspection failed, trying generic introspection')
      }

      // Check Asset schema  
      try {
        const assetSchema = await genericClient.request(INTROSPECT_ASSET)
        console.log('Asset schema fields:', assetSchema.__type?.fields)
      } catch (err) {
        console.log('Asset introspection failed')
      }
    } catch (err) {
      console.log('Schema introspection failed:', err)
    }
  }

  async function fetchAllAssetsPaginated() {
    try {
      console.log('Fetching all assets from whale indexer...')
      const response = await aaveClient.request(GET_ALL_ASSETS)
      
      console.log(`Fetched ${response.assets.nodes.length} assets`)
      
      // Show assets with their decimals and types
      const assetsWithDetails = response.assets.nodes.map((a: Asset) => ({ 
        id: a.id, 
        registryId: a.assetRegistryId,
        symbol: a.symbol, 
        name: a.name, 
        decimals: a.decimals,
        assetType: a.assetType
      }))
      console.log('All assets with details:', assetsWithDetails.slice(0, 10))
      
      // Check for specific asset types
      const assetTypes = response.assets.nodes.reduce((acc: any, asset: Asset) => {
        const type = asset.assetType || 'undefined';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      console.log('Asset type distribution:', assetTypes)
      
      // Show specific assets we're looking for
      const importantAssets = ['0', '1', '10', '100', '102', '1000794', '1000795', '12', '14', '15', '16', '17', '19', '20', '27', '31', '69']
      importantAssets.forEach(id => {
        const found = response.assets.nodes.find((a: Asset) => a.id === id)
        console.log(`Asset ${id}:`, found ? `${found.symbol} (${found.name}) - ${found.decimals} decimals` : 'NOT FOUND')
      })
      
      // Show all assets that contain "GDOT" or "DOT" in symbol or name
      const dotAssets = response.assets.nodes.filter((a: Asset) => 
        a.symbol?.includes('DOT') || a.name?.includes('DOT') || 
        a.symbol?.includes('GDOT') || a.name?.includes('GDOT')
      )
      console.log('DOT-related assets:', dotAssets.map(a => ({ id: a.id, symbol: a.symbol, name: a.name })))
      
      // Show ERC20 assets specifically
      const erc20Assets = response.assets.nodes.filter((a: Asset) => a.assetType === 'Erc20')
      console.log(`Found ${erc20Assets.length} ERC20 assets:`, erc20Assets.map(a => ({ id: a.id, symbol: a.symbol, name: a.name })))
      
      // Debug: Show first 10 assets with their types to verify GraphQL data
      console.log('First 10 assets with types:', response.assets.nodes.slice(0, 10).map(a => ({ 
        id: a.id, 
        symbol: a.symbol, 
        assetType: a.assetType,
        registryId: a.assetRegistryId 
      })))
      
      assets.value = response.assets.nodes
    } catch (err) {
      console.error('Error fetching all assets from whale indexer:', err)
      console.log('Falling back to generic endpoint for basic asset info...')
      // Fallback to simple fetch from generic endpoint
      await fetchAssets()
    }
  }

  async function fetchAssets() {
    try {
      console.log('Fetching assets from generic endpoint (fallback)...')
      const response = await genericClient.request(GET_ASSETS)
      console.log('Assets response from generic endpoint:', response)
      console.log(`Fetched ${response.assets.nodes.length} assets from generic endpoint`)
      
      // Note: Generic endpoint doesn't have assetRegistryId or multiLocationsMetadata
      // but it has basic asset info including assetType
      assets.value = response.assets.nodes
    } catch (err) {
      console.error('Error fetching assets:', err)
      error.value = 'Failed to fetch assets'
    }
  }

  async function fetchAavePools() {
    try {
      console.log('Fetching AAVE pools...')
      const response = await aaveClient.request(GET_AAVE_POOLS)
      console.log('AAVE response:', response)
      aavePools.value = response.aavepoolHistoricalData.nodes
    } catch (err) {
      console.error('Error fetching AAVE pools:', err)
      error.value = 'Failed to fetch AAVE pools'
    }
  }

  async function fetchBlockTimestamp(blockHeight: number) {
    try {
      console.log(`Fetching timestamp for block ${blockHeight} from whale indexer...`)
      const response = await aaveClient.request(GET_BLOCKS_WITH_TIMESTAMPS)
      console.log('Blocks response:', response)
      
      // Find the block that matches our height or is closest
      if (response.blocks?.nodes?.length > 0) {
        const matchingBlock = response.blocks.nodes.find((block: any) => 
          block.height === blockHeight
        )
        
        if (matchingBlock && matchingBlock.timestamp) {
          if (latestBlockInfo.value) {
            latestBlockInfo.value.timestamp = new Date(matchingBlock.timestamp)
            console.log('Found block timestamp:', latestBlockInfo.value.timestamp)
          }
        } else {
          // Use the latest available timestamp as approximation
          const latestBlock = response.blocks.nodes[0]
          if (latestBlock && latestBlock.timestamp) {
            if (latestBlockInfo.value) {
              latestBlockInfo.value.timestamp = new Date(latestBlock.timestamp)
              console.log('Using latest available timestamp:', latestBlockInfo.value.timestamp)
            }
          }
        }
      }
    } catch (err) {
      console.log('Failed to fetch block timestamp from whale indexer:', err)
    }
  }

  async function fetchXYKPoolData(blockHeight?: number) {
    try {
      console.log('Fetching XYK pool data from whale indexer...')
      
      // If no block height provided, get the latest
      let targetBlockHeight = blockHeight
      if (!targetBlockHeight) {
        const latestBlockData = await aaveClient.request(GET_LATEST_BLOCK)
        targetBlockHeight = latestBlockData.assetHistoricalData.nodes[0].paraBlockHeight
        console.log(`Using latest block height: ${targetBlockHeight}`)
      }
      
      const response = await aaveClient.request(GET_XYK_POOLS_FROM_BLOCK, {
        blockHeight: targetBlockHeight
      })
      console.log('XYK pool response from whale indexer:', response)
      
      // Transform the data to our format
      xykPoolData.value = response.xykpoolHistoricalData.nodes.map((node: any) => ({
        id: node.id,
        poolId: node.poolId,
        assetAId: node.assetAId,
        assetBId: node.assetBId,
        assetABalance: node.assetABalance,
        assetBBalance: node.assetBBalance,
        tvlInRefAssetNorm: node.tvlInRefAssetNorm,
        assetA: node.assetA,
        assetB: node.assetB
      }))
      
      console.log(`Total XYK pools: ${xykPoolData.value.length}`)
      const totalTvl = xykPoolData.value.reduce((sum, pool) => sum + parseFloat(pool.tvlInRefAssetNorm || '0'), 0)
      console.log(`Total XYK TVL: $${totalTvl.toFixed(2)}`)
      
    } catch (err) {
      console.error('Error fetching XYK pool data from whale indexer:', err)
      console.error('XYK fetch error details:', err.message)
      error.value = 'Failed to fetch XYK pool data'
    }
  }

  async function fetchStablepoolData(blockHeight?: number) {
    try {
      console.log('Fetching Stablepool data from whale indexer...')
      
      // If no block height provided, get the latest
      let targetBlockHeight = blockHeight
      if (!targetBlockHeight) {
        const latestBlockData = await aaveClient.request(GET_LATEST_BLOCK)
        targetBlockHeight = latestBlockData.assetHistoricalData.nodes[0].paraBlockHeight
        console.log(`Using latest block height: ${targetBlockHeight}`)
      }
      
      const response = await aaveClient.request(GET_STABLEPOOLS_FROM_BLOCK, {
        blockHeight: targetBlockHeight
      })
      console.log('Stablepool response from whale indexer:', response)
      
      // Transform the data to our format
      stablepoolData.value = response.stableswapHistoricalData.nodes.map((node: any) => ({
        id: node.id,
        poolId: node.poolId,
        tvlTotalInRefAssetNorm: node.tvlTotalInRefAssetNorm,
        fee: node.fee,
        shareToken: node.pool?.shareToken,
        assets: (node.stableswapAssetHistoricalDataByPoolHistoricalDataId?.nodes || []).map((assetNode: any) => ({
          id: assetNode.id,
          assetId: assetNode.assetId,
          freeBalance: assetNode.freeBalance,
          tvlInRefAssetNorm: assetNode.tvlInRefAssetNorm,
          asset: assetNode.asset
        }))
      }))
      
      console.log(`Total Stablepools: ${stablepoolData.value.length}`)
      const totalAssets = stablepoolData.value.reduce((sum, pool) => sum + pool.assets.length, 0)
      console.log(`Total Stablepool assets: ${totalAssets}`)
      
    } catch (err) {
      console.error('Error fetching Stablepool data from whale indexer:', err)
      console.error('Stablepool fetch error details:', err.message)
      error.value = 'Failed to fetch Stablepool data'
    }
  }

  async function fetchOmnipoolData(blockHeight?: number) {
    try {
      console.log('Fetching Omnipool data from whale indexer...')
      
      // If no block height provided, get the latest
      let targetBlockHeight = blockHeight
      if (!targetBlockHeight) {
        const latestBlockData = await aaveClient.request(GET_LATEST_BLOCK)
        targetBlockHeight = latestBlockData.assetHistoricalData.nodes[0].paraBlockHeight
        console.log(`Using latest block height: ${targetBlockHeight}`)
      }
      
      const response = await aaveClient.request(GET_OMNIPOOL_FROM_BLOCK, {
        blockHeight: targetBlockHeight
      })
      console.log('Omnipool response from whale indexer:', response)
      
      // Transform the data to match our expected format
      omnipoolData.value = response.omnipoolAssetHistoricalData.nodes.map((node: any) => {
        // For EVM assets (hex addresses), the whale indexer provides the asset info directly
        if (node.assetId && node.assetId.startsWith('0x') && node.asset) {
          // Add the EVM asset to our assets array if not already present
          const existingAsset = assets.value.find(a => a.id === node.assetId)
          if (!existingAsset) {
            assets.value.push({
              id: node.assetId,
              name: node.asset.name || `EVM Asset ${node.assetId.slice(0, 10)}...`,
              symbol: node.asset.symbol || 'UNKNOWN',
              decimals: node.asset.decimals || 18,
              assetType: 'Erc20'
            })
            console.log(`Added EVM asset: ${node.asset.symbol} (${node.assetId})`)
          }
        }
        
        return {
          id: node.id,
          assetId: node.assetId,
          balances: {
            t: "AccountBalances",
            d: [node.freeBalance, "0", "0", "0", "0", "0"] // Using freeBalance as the primary balance
          },
          assetState: null, // Not available in whale indexer
          paraBlockHeight: node.paraBlockHeight,
          poolId: "omnipool",
          pool: { id: "omnipool" },
          // Store the asset info from whale indexer
          _asset: node.asset
        }
      })
      
      // Show all asset IDs in the Omnipool
      const omnipoolAssetIds = response.omnipoolAssetHistoricalData.nodes.map((pool: any) => String(pool.assetId))
      console.log('All Omnipool asset IDs:', omnipoolAssetIds)
      console.log(`Total Omnipool assets: ${omnipoolAssetIds.length}`)
      
      // Extract latest block info
      if (response.omnipoolAssetHistoricalData.nodes.length > 0) {
        latestBlockInfo.value = {
          paraBlock: targetBlockHeight,
          relayBlock: undefined
        }
        console.log('Block info:', latestBlockInfo.value)
        
        // Try to get timestamp from whale indexer
        await fetchBlockTimestamp(targetBlockHeight)
      }
    } catch (err) {
      console.error('Error fetching Omnipool data from whale indexer:', err)
      error.value = 'Failed to fetch Omnipool data'
    }
  }

  async function fetchHistoricalTVLData(period: '1w' | '1m' | '3m' = '1m') {
    try {
      historicalDataLoading.value = true
      // Check cache first (cache for 5 minutes)
      const cacheKey = period
      const cached = historicalDataCache.value[cacheKey]
      const nowTimestamp = Date.now()
      const cacheTimeout = 5 * 60 * 1000 // 5 minutes
      
      if (cached && cached.tvlDataAll && (nowTimestamp - cached.timestamp) < cacheTimeout) {
        console.log(`Using cached data for period: ${period}`)
        historicalTVLDataAll.value = cached.tvlDataAll
        historicalTVLDataNoH2O.value = cached.tvlDataNoH2O
        historicalAssetDataAll.value = cached.assetDataAll
        historicalAssetDataNoH2O.value = cached.assetDataNoH2O
        return
      }
      
      console.log(`Fetching historical TVL data for period: ${period}`)
      
      // Calculate date range and intervals
      const now = new Date()
      let fromDate: Date
      let mainChartPoints = 50
      let sparklinePoints = 15
      let intervalHours: number
      
      switch (period) {
        case '1w':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          intervalHours = Math.ceil((7 * 24) / mainChartPoints) // ~3.5 hours, round to 4
          intervalHours = 4
          break
        case '1m':
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          intervalHours = Math.ceil((30 * 24) / mainChartPoints) // ~14.4 hours, round to 12
          intervalHours = 12
          break
        case '3m':
          fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          intervalHours = Math.ceil((90 * 24) / mainChartPoints) // ~43.2 hours, round to 48 (2 days)
          intervalHours = 48
          break
        default:
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          intervalHours = 12
      }
      
      // Generate time points aligned to hour boundaries
      const timePoints: Date[] = []
      let currentTime = new Date(fromDate)
      
      // Align to start of hour
      currentTime.setMinutes(0, 0, 0)
      
      while (currentTime <= now && timePoints.length < mainChartPoints) {
        timePoints.push(new Date(currentTime))
        currentTime = new Date(currentTime.getTime() + intervalHours * 60 * 60 * 1000)
      }
      
      // Ensure we have the latest time point
      if (timePoints.length > 0 && timePoints[timePoints.length - 1].getTime() < now.getTime() - 60 * 60 * 1000) {
        timePoints.push(new Date(now.getTime()))
      }
      
      console.log(`Generated ${timePoints.length} time points with ${intervalHours}h intervals`)
      
      // Use the first and last time points for GraphQL query range
      const queryFromDate = timePoints[0]
      const queryToDate = timePoints[timePoints.length - 1]
      
      // Format dates for GraphQL (ISO format)
      const fromDateStr = queryFromDate.toISOString()
      const toDateStr = queryToDate.toISOString()
      
      console.log(`Date range: ${fromDateStr} to ${toDateStr}`)
      
      // Get blocks for the date range
      const blocksResponse = await aaveClient.request(GET_HISTORICAL_TVL_DATA, {
        fromDate: fromDateStr,
        toDate: toDateStr
      })
      
      console.log(`Found ${blocksResponse.blocks.nodes.length} blocks in date range`)
      
      // Debug: Check the actual date range of returned blocks
      if (blocksResponse.blocks.nodes.length > 0) {
        const sortedBlocks = [...blocksResponse.blocks.nodes].sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        const firstBlock = sortedBlocks[0]
        const lastBlock = sortedBlocks[sortedBlocks.length - 1]
        const actualStart = new Date(firstBlock.timestamp)
        const actualEnd = new Date(lastBlock.timestamp)
        
        console.log(`Actual block range: ${actualStart.toISOString()} to ${actualEnd.toISOString()}`)
        console.log(`Requested: ${fromDateStr} to ${toDateStr}`)
        
        // If we don't have enough historical data, adjust our time points
        if (actualStart.getTime() > queryFromDate.getTime()) {
          console.warn(`Historical data only available from ${actualStart.toISOString()}, adjusting time points...`)
          
          // Recalculate time points based on actual available data
          const actualDuration = actualEnd.getTime() - actualStart.getTime()
          const actualPoints = Math.min(mainChartPoints, Math.floor(actualDuration / (intervalHours * 60 * 60 * 1000)))
          
          timePoints.length = 0 // Clear existing points
          currentTime = new Date(actualStart)
          currentTime.setMinutes(0, 0, 0)
          
          while (currentTime <= actualEnd && timePoints.length < actualPoints) {
            timePoints.push(new Date(currentTime))
            currentTime = new Date(currentTime.getTime() + intervalHours * 60 * 60 * 1000)
          }
          
          console.log(`Adjusted to ${timePoints.length} time points based on available data`)
        }
      }
      
      // Find the closest blocks to our target time points
      const selectedBlocks: { height: number, timestamp: string }[] = []
      // Sort blocks by timestamp to ensure chronological order
      const allBlocks = [...blocksResponse.blocks.nodes].sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      
      timePoints.forEach(targetTime => {
        // Find the block closest to this time point
        let closestBlock = null
        let closestDiff = Infinity
        
        allBlocks.forEach((block: any) => {
          const blockTime = new Date(block.timestamp)
          const diff = Math.abs(blockTime.getTime() - targetTime.getTime())
          if (diff < closestDiff) {
            closestDiff = diff
            closestBlock = block
          }
        })
        
        if (closestBlock && !selectedBlocks.find(b => b.height === closestBlock.height)) {
          selectedBlocks.push({
            height: closestBlock.height,
            timestamp: closestBlock.timestamp
          })
        }
      })
      
      // Ensure we have the latest block as the last point
      if (selectedBlocks.length > 0) {
        const latestBlockData = await aaveClient.request(GET_LATEST_BLOCK)
        const latestBlock = latestBlockData.assetHistoricalData.nodes[0]
        
        // Replace the last block with the latest block if it's more recent
        const lastSelected = selectedBlocks[selectedBlocks.length - 1]
        if (latestBlock.paraBlockHeight > lastSelected.height) {
          selectedBlocks[selectedBlocks.length - 1] = {
            height: latestBlock.paraBlockHeight,
            timestamp: new Date().toISOString()
          }
        }
      }
      const blockHeights = selectedBlocks.map(block => block.height)
      
      console.log(`Selected ${selectedBlocks.length} daily blocks:`, blockHeights)
      
      // Fetch historical data for all selected blocks in parallel
      const [omnipoolHist, stablepoolHist, xykHist, aaveHist] = await Promise.all([
        aaveClient.request(GET_OMNIPOOL_HISTORICAL_BY_BLOCKS, { blockHeights }),
        aaveClient.request(GET_STABLEPOOLS_HISTORICAL_BY_BLOCKS, { blockHeights }),
        aaveClient.request(GET_XYK_HISTORICAL_BY_BLOCKS, { blockHeights }),
        aaveClient.request(GET_AAVE_HISTORICAL_BY_BLOCKS, { blockHeights })
      ])
      
      console.log('Historical data fetched:', {
        omnipool: omnipoolHist.omnipoolAssetHistoricalData.nodes.length,
        stablepool: stablepoolHist.stableswapHistoricalData.nodes.length,
        xyk: xykHist.xykpoolHistoricalData.nodes.length,
        aave: aaveHist.aavepoolHistoricalData.nodes.length
      })
      
      // Process data by block height
      const historicalDataAll: HistoricalTVLData[] = []
      const historicalDataNoH2O: HistoricalTVLData[] = []
      
      selectedBlocks.forEach(block => {
        const blockHeight = block.height
        const date = new Date(block.timestamp)
        
        // Calculate Omnipool TVL for this block (all assets)
        const omnipoolNodes = omnipoolHist.omnipoolAssetHistoricalData.nodes
          .filter((node: any) => node.paraBlockHeight === blockHeight)
        
        const omnipoolTvlAll = omnipoolNodes
          .reduce((sum: number, node: any) => sum + parseFloat(node.tvlInRefAssetNorm || '0'), 0)
        
        const omnipoolTvlNoH2O = omnipoolNodes
          .filter((node: any) => String(node.assetId) !== '1') // Exclude H2O
          .reduce((sum: number, node: any) => sum + parseFloat(node.tvlInRefAssetNorm || '0'), 0)
        
        // Calculate Stablepool TVL for this block
        const stablepoolTvl = stablepoolHist.stableswapHistoricalData.nodes
          .filter((node: any) => node.paraBlockHeight === blockHeight)
          .reduce((sum: number, node: any) => sum + parseFloat(node.tvlTotalInRefAssetNorm || '0'), 0)
        
        // Calculate XYK TVL for this block
        const xykTvl = xykHist.xykpoolHistoricalData.nodes
          .filter((node: any) => node.paraBlockHeight === blockHeight)
          .reduce((sum: number, node: any) => sum + parseFloat(node.tvlInRefAssetNorm || '0'), 0)
        
        // Calculate Money Market TVL for this block
        const moneyMarketTvl = aaveHist.aavepoolHistoricalData.nodes
          .filter((node: any) => node.paraBlockHeight === blockHeight)
          .reduce((sum: number, node: any) => sum + parseFloat(node.tvlInRefAssetNorm || '0'), 0)
        
        const totalAll = omnipoolTvlAll + stablepoolTvl + xykTvl + moneyMarketTvl
        const totalNoH2O = omnipoolTvlNoH2O + stablepoolTvl + xykTvl + moneyMarketTvl
        
        historicalDataAll.push({
          date,
          omnipool: omnipoolTvlAll,
          stableswap: stablepoolTvl,
          xyk: xykTvl,
          moneyMarket: moneyMarketTvl,
          total: totalAll,
          blockHeight
        })
        
        historicalDataNoH2O.push({
          date,
          omnipool: omnipoolTvlNoH2O,
          stableswap: stablepoolTvl,
          xyk: xykTvl,
          moneyMarket: moneyMarketTvl,
          total: totalNoH2O,
          blockHeight
        })
        
        console.log(`Block ${blockHeight} (${date.toISOString().split('T')[0]}): Omnipool All $${omnipoolTvlAll.toFixed(2)}, No H2O $${omnipoolTvlNoH2O.toFixed(2)}, Total All $${totalAll.toFixed(2)}, Total No H2O $${totalNoH2O.toFixed(2)}`)
      })
      
      // Sort by date
      historicalDataAll.sort((a, b) => a.date.getTime() - b.date.getTime())
      historicalDataNoH2O.sort((a, b) => a.date.getTime() - b.date.getTime())
      
      historicalTVLDataAll.value = historicalDataAll
      historicalTVLDataNoH2O.value = historicalDataNoH2O
      console.log(`Stored ${historicalDataAll.length} historical TVL data points (with and without H2O)`)
      
      // Build historical asset data for sparklines (use subset of blocks for sparklines)
      const assetHistoryMapAll: { [assetId: string]: number[] } = {}
      const assetHistoryMapNoH2O: { [assetId: string]: number[] } = {}
      
      // Select subset of blocks for sparklines (15 points max)
      const sparklineBlocks = selectedBlocks.length <= sparklinePoints 
        ? selectedBlocks 
        : selectedBlocks.filter((_, index) => {
            const step = selectedBlocks.length / sparklinePoints
            return index % Math.floor(step) === 0
          }).slice(0, sparklinePoints)
      
      console.log(`Using ${sparklineBlocks.length} blocks for sparklines out of ${selectedBlocks.length} total blocks`)
      
      sparklineBlocks.forEach(block => {
        const blockHeight = block.height
        
        // Collect TVL data for each asset from all sources for this block
        const blockAssetTvl: { [assetId: string]: number } = {}
        
        // Process Omnipool assets
        omnipoolHist.omnipoolAssetHistoricalData.nodes
          .filter((node: any) => node.paraBlockHeight === blockHeight)
          .forEach((node: any) => {
            const assetIdStr = String(node.assetId)
            const tvlUsd = parseFloat(node.tvlInRefAssetNorm || '0')
            
            if (!blockAssetTvl[assetIdStr]) {
              blockAssetTvl[assetIdStr] = 0
            }
            blockAssetTvl[assetIdStr] += tvlUsd
          })
        
        // Process Stablepool assets
        stablepoolHist.stableswapHistoricalData.nodes
          .filter((node: any) => node.paraBlockHeight === blockHeight)
          .forEach((poolNode: any) => {
            if (poolNode.stableswapAssetHistoricalDataByPoolHistoricalDataId?.nodes) {
              poolNode.stableswapAssetHistoricalDataByPoolHistoricalDataId.nodes.forEach((assetNode: any) => {
                const assetIdStr = String(assetNode.assetId)
                const tvlUsd = parseFloat(assetNode.tvlInRefAssetNorm || '0')
                
                if (!blockAssetTvl[assetIdStr]) {
                  blockAssetTvl[assetIdStr] = 0
                }
                blockAssetTvl[assetIdStr] += tvlUsd
              })
            }
          })
        
        // Process Money Market assets
        aaveHist.aavepoolHistoricalData.nodes
          .filter((node: any) => node.paraBlockHeight === blockHeight)
          .forEach((node: any) => {
            if (node.pool?.reserveAsset?.id) {
              const assetIdStr = String(node.pool.reserveAsset.id)
              const tvlUsd = parseFloat(node.tvlInRefAssetNorm || '0')
              
              if (!blockAssetTvl[assetIdStr]) {
                blockAssetTvl[assetIdStr] = 0
              }
              blockAssetTvl[assetIdStr] += tvlUsd
            }
          })
        
        // Process XYK pools
        xykHist.xykpoolHistoricalData.nodes
          .filter((node: any) => node.paraBlockHeight === blockHeight)
          .forEach((node: any) => {
            const poolTvl = parseFloat(node.tvlInRefAssetNorm || '0')
            
            // Add both assets from the pool (split TVL equally)
            if (node.assetAId) {
              const assetIdStr = String(node.assetAId)
              const tvlUsd = poolTvl / 2
              
              if (!blockAssetTvl[assetIdStr]) {
                blockAssetTvl[assetIdStr] = 0
              }
              blockAssetTvl[assetIdStr] += tvlUsd
            }
            
            if (node.assetBId) {
              const assetIdStr = String(node.assetBId)
              const tvlUsd = poolTvl / 2
              
              if (!blockAssetTvl[assetIdStr]) {
                blockAssetTvl[assetIdStr] = 0
              }
              blockAssetTvl[assetIdStr] += tvlUsd
            }
          })
        
        // Add the combined TVL for each asset to both history maps
        Object.entries(blockAssetTvl).forEach(([assetIdStr, combinedTvl]) => {
          // Store in "All" version
          if (!assetHistoryMapAll[assetIdStr]) {
            assetHistoryMapAll[assetIdStr] = []
          }
          assetHistoryMapAll[assetIdStr].push(combinedTvl)
          
          // Store in "No H2O" version (skip if H2O)
          if (assetIdStr !== '1') {
            if (!assetHistoryMapNoH2O[assetIdStr]) {
              assetHistoryMapNoH2O[assetIdStr] = []
            }
            assetHistoryMapNoH2O[assetIdStr].push(combinedTvl)
          }
        })
      })
      
      historicalAssetDataAll.value = assetHistoryMapAll
      historicalAssetDataNoH2O.value = assetHistoryMapNoH2O
      console.log(`Stored historical data for ${Object.keys(assetHistoryMapAll).length} assets (all) and ${Object.keys(assetHistoryMapNoH2O).length} assets (no H2O)`)
      
      // Cache the data (both versions)
      historicalDataCache.value[cacheKey] = {
        tvlDataAll: [...historicalDataAll],
        tvlDataNoH2O: [...historicalDataNoH2O],
        assetDataAll: { ...assetHistoryMapAll },
        assetDataNoH2O: { ...assetHistoryMapNoH2O },
        timestamp: Date.now()
      }
      console.log(`Cached data for period: ${period}`)
      
      // Debug: Log specific assets we're looking for
      const debugAssets = ['1', '5', '10', '23', '1000765'] // Include tBTC
      const activeAssetHistoryMap = showH2O.value ? assetHistoryMapAll : assetHistoryMapNoH2O
      debugAssets.forEach(assetId => {
        if (activeAssetHistoryMap[assetId]) {
          const asset = assets.value.find(a => a.id === assetId)
          console.log(`Asset ${assetId} (${asset?.symbol || 'Unknown'}): ${activeAssetHistoryMap[assetId].length} data points`, activeAssetHistoryMap[assetId])
        }
      })
      
      // Debug tBTC specifically if it exists
      if (activeAssetHistoryMap['1000765']) {
        console.log('=== tBTC (1000765) Debug ===')
        console.log('Data points:', activeAssetHistoryMap['1000765'].length)
        console.log('Values:', activeAssetHistoryMap['1000765'])
        const values = activeAssetHistoryMap['1000765']
        const min = Math.min(...values)
        const max = Math.max(...values)
        console.log(`Range: $${min.toLocaleString()} - $${max.toLocaleString()}`)
        console.log(`Ratio: ${(max/min).toFixed(2)}x`)
        
        // Check for extreme jumps
        for (let i = 1; i < values.length; i++) {
          const prev = values[i-1]
          const curr = values[i]
          const changePercent = Math.abs(curr - prev) / prev * 100
          if (changePercent > 50) {
            console.log(`⚠️ Jump at index ${i}: ${changePercent.toFixed(1)}% ($${prev.toLocaleString()} → $${curr.toLocaleString()})`)
          }
        }
      } else {
        console.log('No tBTC (1000765) data found in active dataset')
      }
      
    } catch (err) {
      console.error('Error fetching historical TVL data:', err)
      error.value = 'Failed to fetch historical TVL data'
    } finally {
      historicalDataLoading.value = false
    }
  }

  function clearHistoricalDataCache() {
    historicalDataCache.value = {}
    console.log('Historical data cache cleared')
  }

  async function fetchAllData() {
    loading.value = true
    error.value = null
    
    try {
      // First get the latest block height
      console.log('Getting latest block height for all data...')
      const latestBlockData = await aaveClient.request(GET_LATEST_BLOCK)
      const latestBlockHeight = latestBlockData.assetHistoricalData.nodes[0].paraBlockHeight
      console.log(`Latest block height: ${latestBlockHeight}`)
      
      // Fetch all data in parallel from the same block
      await Promise.all([
        fetchAllAssetsPaginated(),
        fetchAavePools(),
        fetchOmnipoolData(latestBlockHeight), // Pass block height to ensure same block
        fetchStablepoolData(latestBlockHeight), // Fetch stablepool data from same block
        fetchXYKPoolData(latestBlockHeight), // Fetch XYK pool data from same block
        introspectSchemas(latestBlockHeight), // Also pass block height for price fetching
        fetchHistoricalTVLData('1m') // Fetch 1 month of historical data by default
      ])
      
      lastUpdated.value = new Date()
    } catch (err) {
      console.error('Error fetching data:', err)
      error.value = 'Failed to fetch data'
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    assets,
    aavePools,
    omnipoolData,
    stablepoolData,
    xykPoolData,
    loading,
    historicalDataLoading,
    error,
    lastUpdated,
    latestBlockInfo,
    priceData,
    historicalTVLData,
    historicalAssetData,
    historicalDataCache,
    showH2O,
    // Computed
    tvlData,
    assetComposition,
    // Actions
    setShowH2O: (value: boolean) => { 
      showH2O.value = value 
      console.log(`H2O toggle changed to: ${value} - switching data reactively`)
    },
    fetchAllData,
    fetchAssets,
    fetchAllAssetsPaginated,
    fetchAavePools,
    fetchOmnipoolData,
    fetchStablepoolData,
    fetchXYKPoolData,
    fetchHistoricalTVLData,
    clearHistoricalDataCache,
    introspectSchemas
  }
})