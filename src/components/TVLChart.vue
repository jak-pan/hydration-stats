<template>
  <div 
    class="tvl-chart-container" 
    @mouseleave="handleMouseLeave"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  Chart,
  ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import type { HistoricalTVLData } from '@/types'

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  data: HistoricalTVLData[]
  loading?: boolean
  period?: '1w' | '1m' | '3m'
  useLogScale?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  period: '1m',
  useLogScale: false
})

const emit = defineEmits<{
  hover: [dataPoint: any]
}>()


const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

function handleMouseLeave() {
  emit('hover', null)
}

function handleTouchEnd() {
  emit('hover', null)
}

const createChart = () => {
  if (!chartCanvas.value || props.data.length === 0) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Calculate average values to sort datasets (biggest on bottom)
  const avgValues = {
    omnipool: props.data.reduce((sum, d) => sum + d.omnipool, 0) / props.data.length,
    stableswap: props.data.reduce((sum, d) => sum + d.stableswap, 0) / props.data.length,
    xyk: props.data.reduce((sum, d) => sum + d.xyk, 0) / props.data.length,
    moneyMarket: props.data.reduce((sum, d) => sum + d.moneyMarket, 0) / props.data.length
  }

  // Sort datasets by average value (largest first = bottom of stack)
  const sortedDatasets = [
    { key: 'omnipool', label: 'Omnipool', avg: avgValues.omnipool, color: '#4FACFE' },
    { key: 'stableswap', label: 'Stable Pools', avg: avgValues.stableswap, color: '#22C55E' },
    { key: 'xyk', label: 'XYK Pools', avg: avgValues.xyk, color: '#A855F7' },
    { key: 'moneyMarket', label: 'Money Market', avg: avgValues.moneyMarket, color: '#F59E0B' }
  ].sort((a, b) => b.avg - a.avg)

  // Prepare data for stacked area chart
  const labels = props.data.map(d => d.date)
  
  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels,
      datasets: sortedDatasets.map(dataset => ({
        label: dataset.label,
        data: props.data.map(d => d[dataset.key as keyof HistoricalTVLData] as number),
        backgroundColor: dataset.color + '20', // 20 = 12.5% opacity
        borderColor: dataset.color,
        borderWidth: 1.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: dataset.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      onHover: (event, activeElements, chart) => {
        if (activeElements.length > 0) {
          const dataIndex = activeElements[0].index
          const data = props.data[dataIndex]
          if (data) {
            emit('hover', {
              date: data.date,
              omnipool: data.omnipool,
              stableswap: data.stableswap,
              xyk: data.xyk,
              moneyMarket: data.moneyMarket,
              total: data.omnipool + data.stableswap + data.xyk + data.moneyMarket
            })
          }
        } else {
          emit('hover', null)
        }
      },
      plugins: {
        title: {
          display: false
        },
        tooltip: {
          enabled: false
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: props.period === '1w' ? 'day' : 'day',
            displayFormats: {
              day: props.period === '1w' ? 'MMM dd' : 'MMM dd'
            }
          },
          title: {
            display: false
          },
          grid: {
            display: false
          },
          border: {
            display: false
          },
          ticks: {
            display: false
          }
        },
        y: {
          type: props.useLogScale ? 'logarithmic' : 'linear',
          stacked: !props.useLogScale, // Stacking doesn't work well with log scale
          beginAtZero: !props.useLogScale,
          title: {
            display: false
          },
          ticks: {
            callback: function(value) {
              const num = value as number
              if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
              if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
              if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
              return `$${num.toFixed(0)}`
            },
            display: false
          },
          grid: {
            display: false
          },
          border: {
            display: false
          }
        }
      }
    }
  }

  chartInstance = new Chart(ctx, config)
}

onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

watch(() => props.data, () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

watch(() => props.loading, (isLoading) => {
  if (!isLoading) {
    nextTick(() => {
      createChart()
    })
  }
})

watch(() => props.useLogScale, () => {
  nextTick(() => {
    createChart()
  })
})
</script>

<style scoped>
.tvl-chart-container {
  width: 100%;
  height: 300px;
  position: relative;
}

canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>