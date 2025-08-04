<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Hydration Stats Dashboard</h1>
      <div class="header-right">
        <div class="update-info">
          <div class="last-updated" v-if="lastUpdated">
            Data fetched: {{ formatTime(lastUpdated) }}
          </div>
          <div class="block-info" v-if="latestBlockInfo">
            Block: #{{ latestBlockInfo.paraBlock.toLocaleString() }}
            <span v-if="latestBlockInfo.relayBlock">
              (Relay: #{{ latestBlockInfo.relayBlock.toLocaleString() }})</span
            >
          </div>
          <div class="block-timestamp" v-if="latestBlockInfo?.timestamp">
            Block time: {{ formatDateTime(latestBlockInfo.timestamp) }}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>

    <!-- Error Display -->
    <div v-if="error" class="card error-card">
      <h3>Error</h3>
      <p>{{ error }}</p>
      <button @click="fetchData" class="btn btn-primary">Retry</button>
    </div>

    <div class="dashboard-grid">
      <!-- TVL Overview Card -->
      <div class="card tvl-card">
        <div class="tvl-header">
          <div class="tvl-header-left">
            <h2>Total Value Locked</h2>
            <div class="tvl-amount" v-if="!loading">
              ${{ formatNumber(displayTvlData.total) }}
            </div>
            <div class="loading" v-else>Loading...</div>
          </div>
          <div class="tvl-header-right">
            <div class="header-controls-stack">
              <!-- Asset Filter Controls -->
              <div class="asset-filter-controls">
                <div class="amm-toggles">
                  <button
                    @click="toggleAllCategories()"
                    :class="['amm-btn', { active: isAllSelected() }]"
                  >
                    All
                  </button>
                  <button
                    @click="toggleCategory('omnipool')"
                    :class="['amm-btn', { active: selectedCategories.has('omnipool') }]"
                  >
                    Omnipool
                  </button>
                  <button
                    @click="toggleCategory('stablepool')"
                    :class="['amm-btn', { active: selectedCategories.has('stablepool') }]"
                  >
                    Stable
                  </button>
                  <button
                    @click="toggleCategory('xyk')"
                    :class="['amm-btn', { active: selectedCategories.has('xyk') }]"
                  >
                    XYK
                  </button>
                  <button
                    @click="toggleCategory('moneymarket')"
                    :class="['amm-btn', { active: selectedCategories.has('moneymarket') }]"
                  >
                    MM
                  </button>
                </div>
                <button
                  @click="handleH2OToggle()"
                  :class="['h2o-btn', { active: showH2O }]"
                  title="Show/hide H2O asset (ID: 1)"
                >
                  H2O
                </button>
              </div>
              
              <div class="chart-controls">
                <button
                  @click="useLogScale = !useLogScale"
                  :class="['log-scale-btn', { active: useLogScale }]"
                  title="Toggle logarithmic scale"
                >
                  Log
                </button>
                <div class="period-toggles">
                  <button
                    @click="handlePeriodChange('1w')"
                    :class="['period-btn', { active: selectedPeriod === '1w' }]"
                  >
                    1W
                  </button>
                  <button
                    @click="handlePeriodChange('1m')"
                    :class="['period-btn', { active: selectedPeriod === '1m' }]"
                  >
                    1M
                  </button>
                  <button
                    @click="handlePeriodChange('3m')"
                    :class="['period-btn', { active: selectedPeriod === '3m' }]"
                  >
                    3M
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tvl-content">
          <div class="tvl-breakdown" v-if="!loading">
            <div class="tvl-breakdown-header">
              <span v-if="hoveredDataPoint">
                {{ hoveredDataPoint.date.toLocaleDateString() }}
                <br />
                {{ hoveredDataPoint.date.toLocaleTimeString() }}
              </span>
              <span v-else>Now</span>
            </div>
            <div class="breakdown-items">
              <div
                v-for="item in sortedTvlBreakdown"
                :key="item.key"
                class="breakdown-item"
              >
                <div class="breakdown-label">
                  <span class="color-indicator" :class="item.colorClass"></span>
                  <span class="label">{{ item.label }}:</span>
                </div>
                <span class="value"> ${{ formatNumber(item.value) }} </span>
              </div>
            </div>
          </div>

          <!-- Historical TVL Chart -->
          <div class="tvl-chart-section" v-if="!loading">
            <div v-if="historicalDataLoading" class="chart-loading-container">
              <LoadingChart :width="600" :height="300" />
            </div>
            <div v-else>
              <TVLChart
                :data="filteredHistoricalTVLData"
                :loading="loading"
                :period="selectedPeriod"
                :use-log-scale="useLogScale"
                @hover="handleChartHover"
              />
              <div v-if="historicalDataWarning" class="data-warning">
                <svg
                  class="warning-icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    fill="currentColor"
                    d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                  />
                </svg>
                {{ historicalDataWarning }}
              </div>
            </div>
          </div>
          <div v-else class="chart-loading">
            <div class="loading">Loading chart data...</div>
          </div>
        </div>
      </div>

      <!-- Asset TVL Card -->
      <div class="card composition-card">
        <div class="card-header">
          <h2>Asset TVL</h2>
        </div>
        <div
          v-if="!loading && filteredAssetComposition.length > 0"
          class="composition-list"
        >
          <div
            v-for="asset in filteredAssetComposition"
            :key="`${asset.category}-${asset.poolId}-${asset.asset?.id}`"
            class="composition-item"
          >
            <div class="asset-info">
              <div class="asset-symbol-with-type">
                <span class="asset-symbol">{{
                  asset.asset?.symbol || "Unknown"
                }}</span>
                <span class="asset-type" :class="getAssetTypeClass(asset.asset?.assetType)">
                  {{ formatAssetType(asset.asset?.assetType) }}
                </span>
              </div>
              <span class="asset-name">{{
                asset.asset?.name || "Unknown Asset"
              }}</span>
              <div class="asset-identifiers">
                <span class="asset-registry-id">
                  Registry: {{ asset.asset?.assetRegistryId || asset.asset?.id }}
                </span>
                <span class="asset-contract-id" v-if="isERC20Asset(asset.asset?.assetType) && asset.asset?.id?.startsWith('0x')" 
                      :title="`Full contract address: ${asset.asset.id}`">
                  <span class="contract-label">Contract:</span>
                  <span class="contract-address-full">{{ asset.asset.id }}</span>
                  <span class="contract-address-short">{{ formatContractAddress(asset.asset.id) }}</span>
                </span>
              </div>
              <div class="asset-pools">
                <button
                  v-for="(pool, index) in getPoolsFromAsset(asset)"
                  :key="`${asset.asset?.id}-pool-${index}`"
                  class="asset-pool-btn"
                  @click="handlePoolClick(pool, asset)"
                  :title="`View ${pool} details`"
                >
                  {{ pool }}
                </button>
              </div>
            </div>
            <div class="asset-stats">
              <div class="asset-values">
                <span class="tvl"
                  >${{
                    formatNumber(getAssetDisplayValue(asset, "tvlUsd"))
                  }}</span
                >
                <span class="tvl-tokens"
                  >{{ formatNumber(getAssetDisplayValue(asset, "tvl")) }}
                  {{ asset.asset?.symbol || "tokens" }}</span
                >
                <span class="percentage"
                  >{{ (asset.percentage || 0).toFixed(1) }}%</span
                >
              </div>
              <LoadingSparkline v-if="historicalDataLoading" />
              <Sparkline
                v-else-if="
                  historicalAssetData[asset.asset?.id || ''] &&
                  historicalAssetData[asset.asset?.id || ''].length > 1
                "
                :data="historicalAssetData[asset.asset?.id || '']"
                :color="
                  getSparklineColor(historicalAssetData[asset.asset?.id || ''])
                "
                :asset-id="asset.asset?.id || ''"
                @hover="handleAssetSparklineHover"
              />
              <div v-else-if="asset.asset?.id" class="no-sparkline-data">
                <span class="no-data-text">No data</span>
                <div
                  class="info-icon-container"
                  @mouseenter="showTooltip = asset.asset?.id"
                  @mouseleave="showTooltip = null"
                >
                  <svg
                    class="info-icon"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <text
                      x="12"
                      y="16"
                      text-anchor="middle"
                      font-size="14"
                      font-weight="bold"
                      fill="currentColor"
                    >
                      i
                    </text>
                  </svg>
                  <div v-if="showTooltip === asset.asset?.id" class="tooltip">
                    {{ getDebugTooltip(asset) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="loading" class="loading">Loading...</div>
        <div v-else class="no-data">
          <p>No data available</p>
          <small
            >Stablepool data: {{ stablepoolData?.length || 0 }} pools</small
          >
          <small
            >Asset composition:
            {{ assetComposition?.length || 0 }} assets</small
          >
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useDataStore } from "@/stores/dataStore";
import { storeToRefs } from "pinia";
import type { AssetComposition } from "@/types";
import TVLChart from "@/components/TVLChart.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import Sparkline from "@/components/Sparkline.vue";
import LoadingChart from "@/components/LoadingChart.vue";
import LoadingSparkline from "@/components/LoadingSparkline.vue";

const dataStore = useDataStore();
const {
  tvlData,
  assetComposition,
  stablepoolData,
  loading,
  historicalDataLoading,
  error,
  lastUpdated,
  latestBlockInfo,
  historicalTVLData,
  historicalAssetData,
  historicalDataCache,
  showH2O,
} = storeToRefs(dataStore);

const selectedCategories = ref<Set<string>>(new Set());
const allSelected = ref<boolean>(true);
const selectedPeriod = ref<"1w" | "1m" | "3m">("1m");
const useLogScale = ref<boolean>(false);
const globalFilter = ref<
  "all" | "omnipool" | "stablepool" | "xyk" | "moneymarket"
>("all");
const hoveredDataPoint = ref<{
  date: Date;
  omnipool: number;
  stableswap: number;
  xyk: number;
  moneyMarket: number;
  total: number;
} | null>(null);
const hoveredAssetData = ref<{
  assetId: string;
  dataIndex: number;
  value: number;
} | null>(null);
const showTooltip = ref<string | null>(null);

const historicalDataWarning = computed(() => {
  if (!historicalTVLData.value.length) return null;

  const firstDate = historicalTVLData.value[0]?.date;
  const lastDate =
    historicalTVLData.value[historicalTVLData.value.length - 1]?.date;

  if (!firstDate || !lastDate) return null;

  const daysDiff = Math.floor(
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const expectedDays = {
    "1w": 7,
    "1m": 30,
    "3m": 90,
  };

  if (daysDiff < expectedDays[selectedPeriod.value] * 0.8) {
    return `Limited data: showing ${daysDiff} days (${firstDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()})`;
  }

  return null;
});

const getAssetDisplayValue = (
  asset: AssetComposition,
  field: "tvlUsd" | "tvl"
) => {
  const assetId = asset.asset?.id;
  if (
    !assetId ||
    !hoveredAssetData.value ||
    hoveredAssetData.value.assetId !== assetId
  ) {
    return asset[field] || 0;
  }

  // Calculate the ratio from the sparkline hover
  const currentValue = asset[field] || 0;
  const currentSparklineValue =
    historicalAssetData.value[assetId]?.[
      historicalAssetData.value[assetId].length - 1
    ] || 0;
  const hoveredSparklineValue = hoveredAssetData.value.value;

  if (currentSparklineValue === 0) return currentValue;

  const ratio = hoveredSparklineValue / currentSparklineValue;
  return currentValue * ratio;
};

const filteredAssetComposition = computed(() => {
  let filtered = assetComposition.value;

  // Filter out H2O asset (ID: 1) by default unless showH2O is true
  if (!showH2O.value) {
    filtered = filtered.filter((asset) => asset.asset?.id !== "1");
  }

  // Apply global filter first
  if (globalFilter.value !== "all") {
    filtered = filtered.filter(
      (asset) => asset.category === globalFilter.value
    );
  }

  // Then apply category filter (for backward compatibility)
  if (!allSelected.value) {
    filtered = filtered.filter((asset) =>
      selectedCategories.value.has(asset.category)
    );
  }

  // Now we can safely combine assets by symbol since we've fixed the sparkline data aggregation
  // The historical data now properly sums TVL from all sources for each asset
  const combined = new Map<string, AssetComposition>();

  filtered.forEach((asset) => {
    const key = asset.asset?.symbol || asset.asset?.id || "Unknown";

    if (combined.has(key)) {
      const existing = combined.get(key)!;
      // Combine the values
      existing.tvl += asset.tvl;
      existing.tvlUsd += asset.tvlUsd;
      // Keep track of multiple pools in the name
      if (!existing.poolName?.includes(" + ")) {
        existing.poolName = `${existing.poolName} + ${asset.poolName}`;
      } else if (!existing.poolName.includes(asset.poolName || "")) {
        existing.poolName += ` + ${asset.poolName}`;
      }
    } else {
      // Create a copy to avoid modifying the original
      combined.set(key, { ...asset });
    }
  });

  const result = Array.from(combined.values());

  // Recalculate percentages based on total USD value
  const totalUsd = result.reduce((sum, asset) => sum + asset.tvlUsd, 0);
  result.forEach((asset) => {
    asset.percentage = totalUsd > 0 ? (asset.tvlUsd / totalUsd) * 100 : 0;
  });

  return result.sort((a, b) => b.tvlUsd - a.tvlUsd);
});

const filteredTvlData = computed(() => {
  const base = tvlData.value;

  if (globalFilter.value === "all") {
    return base;
  }

  // Return filtered data based on global filter
  const filtered = {
    total: 0,
    omnipool: 0,
    stableswap: 0,
    xyk: 0,
    moneyMarket: 0,
    totalTokens: 0,
    omnipoolTokens: 0,
  };

  switch (globalFilter.value) {
    case "omnipool":
      filtered.total = base.omnipool;
      filtered.omnipool = base.omnipool;
      filtered.totalTokens = base.omnipoolTokens || 0;
      filtered.omnipoolTokens = base.omnipoolTokens || 0;
      break;
    case "stablepool":
      filtered.total = base.stableswap;
      filtered.stableswap = base.stableswap;
      break;
    case "xyk":
      filtered.total = base.xyk;
      filtered.xyk = base.xyk;
      break;
    case "moneymarket":
      filtered.total = base.moneyMarket;
      filtered.moneyMarket = base.moneyMarket;
      break;
  }

  return filtered;
});

const filteredHistoricalTVLData = computed(() => {
  // For now, let's not filter H2O from historical data to avoid breaking the chart
  // TODO: Implement proper H2O filtering at the data store level
  let baseData = historicalTVLData.value;

  if (globalFilter.value === "all") {
    return baseData;
  }

  // Filter historical data based on global filter
  return baseData.map((dataPoint) => {
    const filtered = {
      date: dataPoint.date,
      omnipool: 0,
      stableswap: 0,
      xyk: 0,
      moneyMarket: 0,
      total: 0,
      blockHeight: dataPoint.blockHeight,
    };

    switch (globalFilter.value) {
      case "omnipool":
        filtered.omnipool = dataPoint.omnipool;
        filtered.total = dataPoint.omnipool;
        break;
      case "stablepool":
        filtered.stableswap = dataPoint.stableswap;
        filtered.total = dataPoint.stableswap;
        break;
      case "xyk":
        filtered.xyk = dataPoint.xyk;
        filtered.total = dataPoint.xyk;
        break;
      case "moneymarket":
        filtered.moneyMarket = dataPoint.moneyMarket;
        filtered.total = dataPoint.moneyMarket;
        break;
    }

    return filtered;
  });
});

const displayTvlData = computed(() => {
  // For legend display, use the hovered data point if available, otherwise use filtered current data
  if (hoveredDataPoint.value) {
    return hoveredDataPoint.value;
  }
  return filteredTvlData.value;
});

const sortedTvlBreakdown = computed(() => {
  const data = displayTvlData.value;

  const breakdown = [
    {
      key: "omnipool",
      label: "Omnipool",
      value: data.omnipool,
      colorClass: "omnipool-color",
    },
    {
      key: "moneymarket",
      label: "Money Market",
      value: data.moneyMarket,
      colorClass: "moneymarket-color",
    },
    {
      key: "stablepool",
      label: "Stable Pools",
      value: data.stableswap,
      colorClass: "stablepool-color",
    },
    {
      key: "xyk",
      label: "XYK Pools",
      value: data.xyk,
      colorClass: "xyk-color",
    },
  ];

  // Sort by value ascending (smallest first = top, biggest last = bottom)
  return breakdown.sort((a, b) => a.value - b.value);
});

function formatNumber(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(2) + "K";
  return value.toFixed(2);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}

function formatDateTime(date: Date): string {
  return date.toLocaleString();
}

function toggleCategory(category: string) {
  // Check if this category is currently the only one selected
  const isCurrentlySelected =
    selectedCategories.value.has(category) &&
    selectedCategories.value.size === 1;

  if (isCurrentlySelected) {
    // If clicking the only selected category, switch back to "All"
    allSelected.value = true;
    selectedCategories.value.clear();
    globalFilter.value = "all";
  } else {
    // Select only this category
    allSelected.value = false;
    selectedCategories.value.clear();
    selectedCategories.value.add(category);

    // Update global filter for main chart
    const filterMap: { [key: string]: typeof globalFilter.value } = {
      omnipool: "omnipool",
      stablepool: "stablepool",
      xyk: "xyk",
      moneymarket: "moneymarket",
    };
    globalFilter.value = filterMap[category] || "all";
  }

  // Trigger reactivity
  selectedCategories.value = new Set(selectedCategories.value);
}

function toggleAllCategories() {
  // Toggle "All" mode - when All is active, individual categories are cleared
  allSelected.value = !allSelected.value;
  selectedCategories.value.clear();
  globalFilter.value = "all";
}

function isAllSelected(): boolean {
  return allSelected.value;
}

function handlePeriodChange(period: "1w" | "1m" | "3m") {
  selectedPeriod.value = period;

  // Fetch new historical data for the selected period
  console.log(`Period changed to ${period}, fetching new data...`);
  dataStore.fetchHistoricalTVLData(period);
}

function setGlobalFilter(
  filter: "all" | "omnipool" | "stablepool" | "xyk" | "moneymarket"
) {
  globalFilter.value = filter;
  console.log(`Global filter changed to: ${filter}`);
}

function handleLegendClick(key: string) {
  // Map the breakdown keys to filter values
  const filterMap: {
    [key: string]: "all" | "omnipool" | "stablepool" | "xyk" | "moneymarket";
  } = {
    omnipool: "omnipool",
    stablepool: "stablepool",
    xyk: "xyk",
    moneymarket: "moneymarket",
  };

  const newFilter = filterMap[key];
  if (newFilter) {
    // Toggle filter: if clicking the same filter, go back to 'all'
    if (globalFilter.value === newFilter) {
      globalFilter.value = "all";
    } else {
      globalFilter.value = newFilter;
    }
    console.log(`Legend clicked: ${key}, filter set to: ${globalFilter.value}`);
  }
}

function handleH2OToggle() {
  const newValue = !showH2O.value;
  dataStore.setShowH2O(newValue);
  // No need to refetch - data switching happens reactively!
}

function getSparklineColor(data: number[]): string {
  if (!data || data.length < 2) return "#4FACFE";

  const firstValue = data[0];
  const lastValue = data[data.length - 1];

  // Green for increase, red for decrease
  return lastValue >= firstValue ? "#22C55E" : "#EF4444";
}

function formatAssetType(assetType?: string): string {
  if (!assetType) return "Unknown";
  
  switch (assetType.toLowerCase()) {
    case "erc20":
      return "ERC20";
    case "token":
      return "Native";
    case "poolshare":
    case "sharetoken":
      return "Share";
    case "external":
      return "External";
    case "bond":
      return "Bond";
    default:
      return assetType;
  }
}

function getAssetTypeClass(assetType?: string): string {
  if (!assetType) return "asset-type-unknown";
  
  switch (assetType.toLowerCase()) {
    case "erc20":
      return "asset-type-erc20";
    case "token":
      return "asset-type-native";
    case "poolshare":
    case "sharetoken":
      return "asset-type-share";
    case "external":
      return "asset-type-external";  
    case "bond":
      return "asset-type-bond";
    default:
      return "asset-type-other";
  }
}

function isERC20Asset(assetType?: string): boolean {
  return assetType?.toLowerCase() === "erc20";
}

function formatContractAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return address;
  
  // Format as 0x1234...5678 (first 6 + last 4 characters)
  if (address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
}


function getPoolsFromAsset(asset: AssetComposition): string[] {
  const poolName = asset.poolName || asset.category || "";

  // Check if it's a combined pool name (contains " + ")
  if (poolName.includes(" + ")) {
    // Split by " + " and return individual pools
    return poolName.split(" + ").map((p) => p.trim());
  }

  // Return single pool name
  return [poolName];
}

function handlePoolClick(poolName: string, asset: AssetComposition) {
  // TODO: Navigate to pool detail page
  console.log(
    "Pool clicked:",
    poolName,
    "Asset:",
    asset.asset?.symbol,
    "Pool ID:",
    asset.poolId
  );
}

function handleChartHover(dataPoint: any) {
  if (dataPoint) {
    hoveredDataPoint.value = dataPoint;
  } else {
    hoveredDataPoint.value = null;
  }
}

function handleAssetSparklineHover(
  data: { assetId: string; dataIndex: number; value: number } | null
) {
  if (data) {
    hoveredAssetData.value = data;
  } else {
    hoveredAssetData.value = null;
  }
}

function getDebugTooltip(asset: AssetComposition): string {
  const assetId = asset.asset?.id;
  if (!assetId) return "No asset ID available";

  const histData = historicalAssetData.value[assetId];
  const dataPoints = histData ? histData.length : 0;

  let tooltip = `Asset ${asset.asset?.symbol} (ID: ${assetId})\n`;
  tooltip += `Data points: ${dataPoints} (${selectedPeriod.value})\n`;

  if (histData && histData.length > 0) {
    const min = Math.min(...histData);
    const max = Math.max(...histData);
    tooltip += `Range: $${formatNumber(min)} - $${formatNumber(max)}\n`;
    tooltip += `Recent values: ${histData
      .slice(0, 3)
      .map((v) => `$${Math.round(v / 1000000)}M`)
      .join(", ")}`;
    if (histData.length > 3) tooltip += "...";
  } else {
    tooltip += "Insufficient historical data for chart";
  }

  return tooltip;
}

async function fetchData() {
  console.log("=== Starting data fetch ===");
  await dataStore.fetchAllData();

  // Compact summary of fetched data
  const summary = {
    stableswapPools: stablepoolData.value?.length || 0,
    stableswapAssets: assetComposition.value.filter(
      (a) => a.category === "stablepool"
    ).length,
    totalAssets: Object.keys(historicalAssetData.value).length,
    cacheStatus: Object.keys(historicalDataCache.value).map((period) => ({
      period,
      tvlPoints: historicalDataCache.value[period].tvlDataAll?.length || 0,
      assetCount: Object.keys(
        historicalDataCache.value[period].assetDataAll || {}
      ).length,
      cachedAt: new Date(
        historicalDataCache.value[period].timestamp
      ).toLocaleTimeString(),
    })),
    // Sample sparkline data for top 5 assets
    sparklineStatus: assetComposition.value.slice(0, 5).reduce((acc, asset) => {
      const assetId = asset.asset?.id;
      if (assetId) {
        const histData = historicalAssetData.value[assetId];
        acc[`${asset.asset?.symbol}(${assetId})`] = histData
          ? histData.length
          : 0;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  console.log("Data fetch complete:", summary);
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dashboard {
  /* Layout handled by parent Layout component */
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-l);
  border-bottom: 1px solid var(--border-base);
}

.dashboard-header h1 {
  margin: 0;
  font-size: var(--font-size-h1);
  font-weight: 600;
  color: var(--surface-main-accent);
  line-height: 1.2;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-l);
}

.update-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.last-updated,
.block-info,
.block-timestamp {
  color: var(--text-medium);
  font-size: var(--font-size-small);
}

.block-info,
.block-timestamp {
  font-family: monospace;
  color: var(--text-low);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

.tvl-card {
  grid-column: 1;
  grid-row: 1;
}

.composition-card {
  grid-column: 1;
  grid-row: 2;
}

.tvl-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-base);
  padding-bottom: var(--spacing-m);
  margin-bottom: var(--spacing-l);
}

.tvl-header-left {
  flex: 1;
}

.tvl-header-right {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
}

.header-controls-stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-s);
  align-items: flex-end;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-s);
}

.tvl-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--surface-main-accent);
  margin: var(--spacing-l) 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.tvl-amount-subtitle {
  font-size: var(--font-size-small);
  font-weight: normal;
  color: var(--text-medium);
  margin-top: var(--spacing-xs);
}

.value-subtitle {
  font-size: var(--font-size-small);
  color: var(--text-medium);
  font-weight: normal;
  margin-top: 2px;
}

.tvl-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: var(--spacing-xl);
  align-items: start;
}

.tvl-breakdown {
  display: flex;
  flex-direction: column;
  height: 300px;
  padding: var(--spacing-l) 0;
}

.tvl-breakdown-header {
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--text-medium);
  font-weight: 500;
  line-height: 1.4;
  min-height: 40px;
}

.breakdown-items {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.breakdown-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.omnipool-color {
  background-color: #4facfe;
}

.stablepool-color {
  background-color: #22c55e;
}

.xyk-color {
  background-color: #a855f7;
}

.moneymarket-color {
  background-color: #f59e0b;
}

.tvl-chart-section {
  min-height: 300px;
  position: relative;
}

.data-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-small);
  color: var(--text-medium);
  background: var(--surface-background);
  padding: var(--spacing-xs) var(--spacing-s);
  border-radius: var(--radius-base);
  margin-top: var(--spacing-s);
  border: 1px solid var(--border-base);
}

.warning-icon {
  color: var(--color-utility-yellow-500, #f59e0b);
  flex-shrink: 0;
}

.chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: var(--text-medium);
}

.chart-loading-container {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-background);
  border-radius: var(--radius-base);
  border: 1px solid var(--border-base);
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-s) var(--spacing-m);
  border-radius: var(--radius-base);
  transition: all 0.2s ease;
  flex: 1;
  min-height: 60px;
}

.breakdown-item.clickable {
  cursor: pointer;
}

.breakdown-item.clickable:hover {
  background: var(--surface-main);
  transform: translateX(2px);
}

.breakdown-item.active {
  background: var(--surface-main);
  border: 2px solid var(--surface-main-accent);
}

.breakdown-item.dimmed {
  opacity: 0.5;
}

.label {
  color: var(--text-medium);
}

.value {
  font-weight: 600;
  color: var(--text-high);
  font-size: var(--font-size-body);
}

.composition-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);
}

.composition-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-s);
  background: var(--surface-background);
  border-radius: var(--radius-base);
}

.asset-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.asset-symbol-with-type {
  display: flex;
  align-items: center;
  gap: var(--spacing-s);
}

.asset-symbol {
  font-weight: 600;
  color: var(--text-high);
}

.asset-name {
  font-size: var(--font-size-small);
  color: var(--text-medium);
}

.asset-identifiers {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.asset-registry-id,
.asset-contract-id,
.asset-location,
.asset-id {
  font-size: var(--font-size-small);
  color: var(--text-low);
  font-family: monospace;
}

.asset-contract-id {
  color: #4FACFE;
  cursor: help;
  display: flex;
  align-items: center;
  gap: 4px;
}

.contract-address-full {
  display: inline;
}

.contract-address-short {
  display: none;
}

/* Show shortened address on mobile */
@media (max-width: 768px) {
  .contract-address-full {
    display: none;
  }
  
  .contract-address-short {
    display: inline;
  }
}

.asset-location {
  color: #F59E0B;
  font-weight: 500;
}

.asset-type {
  font-size: var(--font-size-small);
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.asset-type-erc20 {
  background: rgba(79, 172, 254, 0.15);
  color: #4FACFE;
}

.asset-type-native {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.asset-type-share {
  background: rgba(168, 85, 247, 0.15);
  color: #A855F7;
}

.asset-type-external {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}

.asset-type-bond {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.asset-type-unknown,
.asset-type-other {
  background: rgba(156, 163, 175, 0.15);
  color: #9CA3AF;
}

.asset-pools {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.asset-pool-btn {
  font-size: var(--font-size-small);
  color: var(--surface-main-accent);
  background: var(--surface-background);
  border: 1px solid var(--surface-main-accent);
  border-radius: 20px;
  padding: 2px var(--spacing-s);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.5;
}

.asset-pool-btn:hover {
  background: var(--surface-main-accent);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.asset-pool-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.asset-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-m);
}

.asset-values {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.tvl {
  font-weight: 500;
  color: var(--text-high);
}

.tvl-tokens {
  font-size: var(--font-size-small);
  color: var(--text-medium);
  font-weight: normal;
  white-space: nowrap;
}

.percentage {
  font-size: var(--font-size-small);
  color: var(--text-medium);
}

.no-sparkline-data {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-small);
  color: var(--text-medium);
}

.no-data-text {
  color: var(--text-low);
  font-style: italic;
}

.info-icon-container {
  position: relative;
  display: flex;
  align-items: center;
}

.info-icon {
  color: var(--text-low);
  cursor: help;
  transition: color 0.2s ease;
}

.info-icon:hover {
  color: var(--text-medium);
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface-high);
  color: var(--text-high);
  padding: var(--spacing-s);
  border-radius: var(--radius-base);
  font-size: var(--font-size-small);
  font-family: monospace;
  white-space: pre-line;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-base);
  z-index: 1000;
  margin-bottom: var(--spacing-xs);
  min-width: 200px;
  text-align: left;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--surface-high);
}

.loading,
.no-data {
  text-align: center;
  color: var(--text-medium);
  padding: var(--spacing-xl);
}

.error-card {
  background: rgba(255, 44, 35, 0.1);
  border-color: var(--color-utility-red-500);
  margin-bottom: var(--spacing-xl);
}

.error-card h3 {
  color: var(--color-utility-red-500);
  margin-bottom: var(--spacing-m);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-l);
}

.card-header h2 {
  margin: 0;
}

.filter-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.filter-btn {
  padding: var(--spacing-xs) var(--spacing-s);
  border: 1px solid var(--border-base);
  background: var(--surface-background);
  color: var(--text-medium);
  border-radius: var(--radius-base);
  cursor: pointer;
  font-size: var(--font-size-small);
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--surface-main);
  color: var(--text-high);
}

.filter-btn.active {
  background: var(--surface-main-accent);
  color: white;
  border-color: var(--surface-main-accent);
}

.period-toggles {
  display: flex;
  background: var(--surface-background);
  border-radius: var(--radius-base);
  border: 1px solid var(--border-base);
  overflow: hidden;
}

.period-btn {
  padding: var(--spacing-xs) var(--spacing-s);
  border: none;
  background: transparent;
  color: var(--text-medium);
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: 500;
  transition: all 0.2s ease;
  border-right: 1px solid var(--border-base);
}

.period-btn:last-child {
  border-right: none;
}

.period-btn:hover {
  background: var(--surface-main);
  color: var(--text-high);
}

.period-btn.active {
  background: var(--surface-main-accent);
  color: white;
}

.log-scale-btn {
  padding: var(--spacing-xs) var(--spacing-s);
  border: 1px solid var(--border-base);
  background: var(--surface-background);
  color: var(--text-medium);
  border-radius: var(--radius-base);
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1.4;
}

.log-scale-btn:hover {
  background: var(--surface-main);
  color: var(--text-high);
}

.log-scale-btn.active {
  background: var(--surface-main-accent);
  color: white;
  border-color: var(--surface-main-accent);
}

.h2o-btn {
  padding: var(--spacing-xs) var(--spacing-s);
  border: 1px solid var(--border-base);
  background: var(--surface-background);
  color: var(--text-medium);
  border-radius: var(--radius-base);
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1.4;
}

.h2o-btn:hover {
  background: var(--surface-main);
  color: var(--text-high);
}

.h2o-btn.active {
  background: var(--surface-main-accent);
  color: white;
  border-color: var(--surface-main-accent);
}

.asset-filter-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-m);
}

.amm-toggles {
  display: flex;
  background: var(--surface-background);
  border-radius: var(--radius-base);
  border: 1px solid var(--border-base);
  overflow: hidden;
}

.amm-btn {
  padding: var(--spacing-xs) var(--spacing-s);
  border: none;
  background: transparent;
  color: var(--text-medium);
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: 500;
  transition: all 0.2s ease;
  border-right: 1px solid var(--border-base);
}

.amm-btn:last-child {
  border-right: none;
}

.amm-btn:hover {
  background: var(--surface-main);
  color: var(--text-high);
}

.amm-btn.active {
  background: var(--surface-main-accent);
  color: white;
}


@media (max-width: 1024px) {
  .tvl-content {
    grid-template-columns: 200px 1fr;
    gap: var(--spacing-l);
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .tvl-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-l);
  }

  .tvl-breakdown {
    border-bottom: 1px solid var(--border-base);
    padding-bottom: var(--spacing-l);
    margin-bottom: var(--spacing-l);
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-s);
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .update-info {
    align-items: flex-start;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-s);
  }

  .filter-buttons {
    width: 100%;
    justify-content: center;
  }

  .filter-btn {
    flex: 1;
    text-align: center;
  }

  .tvl-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-m);
  }

  .tvl-header-right {
    width: 100%;
    justify-content: center;
  }

  .header-controls-stack {
    width: 100%;
    align-items: center;
  }

  .chart-controls {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-s);
  }

  .log-scale-btn {
    padding: var(--spacing-xs) var(--spacing-xs);
  }

  .asset-filter-controls {
    width: 100%;
    justify-content: center;
    gap: var(--spacing-s);
  }

}
</style>
