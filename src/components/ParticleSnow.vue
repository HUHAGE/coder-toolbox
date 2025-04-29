<template>
  <canvas ref="canvas" class="particle-snow"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let animationFrame: number
let ctx: CanvasRenderingContext2D | null = null

interface Particle {
  x: number
  y: number
  radius: number
  speed: number
  color: string
  alpha: number
  direction: number
}

const particles: Particle[] = []
const colors = [
  '#ff9a9e',  // 粉红
  '#fad0c4',  // 浅粉
  '#ffecd2',  // 米色
  '#fcb69f',  // 珊瑚色
  '#ffffff',  // 白色
  '#a8edea',  // 浅青
  '#fed6e3',  // 浅玫瑰
  '#d4fc79',  // 浅绿
  '#96e6a1',  // 薄荷绿
  '#84fab0',  // 青绿
  '#c2e9fb',  // 天蓝
  '#a6c1ee',  // 淡紫蓝
  '#fccb90',  // 杏色
  '#e9defa'   // 淡紫
]
const particleCount = 150

function createParticle(): Particle {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 4 + 2, // 增大粒子尺寸范围：2-6px
    speed: Math.random() * 1 + 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.5 + 0.5,
    direction: Math.random() * 2 - 1
  }
}

function initParticles() {
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle())
  }
}

function resizeCanvas() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
  }
}

function updateParticles() {
  particles.forEach(particle => {
    particle.y += particle.speed
    particle.x += particle.direction * 0.3

    // 添加摆动效果
    particle.direction += (Math.random() - 0.5) * 0.1
    particle.direction = Math.max(-1, Math.min(1, particle.direction))

    if (particle.y > window.innerHeight) {
      particle.y = -10
      particle.x = Math.random() * window.innerWidth
    }
    if (particle.x < 0) {
      particle.x = window.innerWidth
    }
    if (particle.x > window.innerWidth) {
      particle.x = 0
    }
  })
}

function drawParticles() {
  if (!ctx || !canvas.value) return

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  particles.forEach(particle => {
    ctx!.beginPath()
    const gradient = ctx!.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.radius
    )
    gradient.addColorStop(0, `${particle.color}`)
    gradient.addColorStop(1, `${particle.color}00`)
    
    ctx!.fillStyle = gradient
    ctx!.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    ctx!.fill()
  })
}

function animate() {
  updateParticles()
  drawParticles()
  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    resizeCanvas()
    initParticles()
    animate()
  }

  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.particle-snow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style> 