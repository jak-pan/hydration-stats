<template>
  <div class="loading-sparkline-container">
    <canvas ref="sparklineCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const sparklineCanvas = ref<HTMLCanvasElement>()
let animationId: number | null = null
let startTime: number | null = null

const createSparklineLoading = () => {
  if (!sparklineCanvas.value) return

  const canvas = sparklineCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size to match sparkline dimensions
  canvas.width = 60
  canvas.height = 24

  // Get CSS custom properties for theming
  const computedStyle = getComputedStyle(document.documentElement)
  const strokeColor = computedStyle.getPropertyValue('--text-low').trim() || '#9CA3AF'

  const animate = (currentTime: number) => {
    if (!startTime) startTime = currentTime
    const elapsed = currentTime - startTime

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Sine wave parameters optimized for sparkline
    const amplitude = canvas.height * 0.25 // Smaller amplitude for sparkline
    const frequency = 0.15 // Higher frequency for more waves in small space
    const speed = 0.003 // Slower, more subtle animation
    const centerY = canvas.height / 2
    
    // Smooth oscillating phase
    const phase = Math.sin(elapsed * speed) * Math.PI * 1.5

    // Draw sparkline sine wave
    ctx.beginPath()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    let isFirst = true
    for (let x = 0; x <= canvas.width; x += 1) {
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
  createSparklineLoading()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.loading-sparkline-container {
  width: 60px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  width: 100%;
  height: 100%;
  opacity: 0.4;
}
</style>