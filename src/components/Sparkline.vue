<template>
  <div class="sparkline-container" @mouseleave="handleMouseLeave">
    <canvas ref="sparklineCanvas"></canvas>
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
  CategoryScale
} from 'chart.js'

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
)

interface Props {
  data: number[]
  color?: string
  assetId?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#4FACFE'
})

const emit = defineEmits<{
  hover: [data: { assetId: string; dataIndex: number; value: number } | null]
}>()

const sparklineCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

function handleMouseLeave() {
  emit('hover', null)
}

const createSparkline = () => {
  if (!sparklineCanvas.value || props.data.length === 0) return

  const ctx = sparklineCanvas.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Take maximum 10 points, evenly distributed
  const maxPoints = 10
  const dataPoints = props.data.length <= maxPoints 
    ? props.data 
    : props.data.filter((_, index) => {
        const step = props.data.length / maxPoints
        return index % Math.floor(step) === 0
      }).slice(0, maxPoints)

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels: dataPoints.map((_, i) => i), // Simple index labels
      datasets: [{
        data: dataPoints,
        borderColor: props.color,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          display: false,
          beginAtZero: false
        }
      },
      elements: {
        point: {
          pointStyle: false
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      onHover: (event, activeElements, chart) => {
        if (activeElements.length > 0 && props.assetId) {
          const dataIndex = activeElements[0].index
          const value = dataPoints[dataIndex]
          if (value !== undefined) {
            emit('hover', {
              assetId: props.assetId,
              dataIndex,
              value
            })
          }
        } else {
          emit('hover', null)
        }
      }
    }
  }

  chartInstance = new Chart(ctx, config)
}

onMounted(() => {
  nextTick(() => {
    createSparkline()
  })
})

watch(() => [props.data, props.color], () => {
  nextTick(() => {
    createSparkline()
  })
}, { deep: true })
</script>

<style scoped>
.sparkline-container {
  width: 60px;
  height: 24px;
  position: relative;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>