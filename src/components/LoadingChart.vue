<template>
  <div class="loading-chart-container">
    <canvas ref="loadingCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 24
})

const loadingCanvas = ref<HTMLCanvasElement>()
let animationId: number | null = null
let startTime: number | null = null

const createLoadingAnimation = () => {
  if (!loadingCanvas.value) return

  const canvas = loadingCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.width = props.width
  canvas.height = props.height

  // Get CSS custom properties for theming
  const computedStyle = getComputedStyle(document.documentElement)
  const strokeColor = computedStyle.getPropertyValue('--text-low').trim() || '#9CA3AF'

  const animate = (currentTime: number) => {
    if (!startTime) startTime = currentTime
    const elapsed = currentTime - startTime

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Sine wave parameters
    const amplitude = props.height * 0.3 // 30% of height
    const frequency = 0.02 // Controls wave density
    const speed = 0.005 // Controls animation speed
    const centerY = props.height / 2
    
    // Phase shift for left-to-right animation that bounces back
    const phase = Math.sin(elapsed * speed) * Math.PI * 2

    // Draw sine wave
    ctx.beginPath()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    let isFirst = true
    for (let x = 0; x <= canvas.width; x += 2) {
      const y = centerY + amplitude * Math.sin(x * frequency + phase)
      
      if (isFirst) {
        ctx.moveTo(x, y)
        isFirst = false
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Continue animation
    animationId = requestAnimationFrame(animate)
  }

  // Start animation
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  createLoadingAnimation()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.loading-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  width: 100%;
  height: 100%;
  opacity: 0.6;
}
</style>