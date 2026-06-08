<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useSkillStore } from '@/stores/skill'
import { useEquipmentStore } from '@/stores/equipment'
import { useAchievementStore } from '@/stores/achievement'

const router = useRouter()
const player = usePlayerStore()
const skill = useSkillStore()
const equip = useEquipmentStore()
const achievement = useAchievementStore()

const hasSave = !!localStorage.getItem('bug-exe-player')

const quotes = [
  '这个 Bug 一定是环境问题',
  '昨天还能跑的',
  '我电脑上没问题啊',
  '你先清一下缓存试试',
  '这个需求很简单，怎么实现我不管',
  '在做了，在编译了',
  '改一行代码应该没事吧',
  '加个临时工单，后面再优化',
  '今天不加班，明天就加人',
  '代码写得烂，加班来凑',
  '重启一下试试',
  '这个 PR 我还没 review',
  '测试环境没问题啊',
  '肯定是后端接口的锅',
  '我本地跑得好好的',
  '这个遗留代码不是我的',
  '周五下午别上线',
  '先上线再说',
  '这个之前改过了啊',
  '需求又变了？',
]
const currentQuote = ref(quotes[Math.floor(Math.random() * quotes.length)])
let quoteTimer = null
let rainTimer = null

const rainCanvas = ref(null)

function initCodeRain(canvas) {
  const ctx = canvas.getContext('2d')
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/{}[]|&^%$#@!~*-+=;:.'
  const fontSize = 14
  let cols, drops

  function resize() {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    cols = Math.floor(canvas.width / fontSize)
    drops = Array.from({ length: cols }, () => Math.floor(Math.random() * (canvas.height / fontSize)))
  }

  function draw() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#34d399'
    ctx.font = fontSize + 'px monospace'
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      ctx.fillText(char, i * fontSize, drops[i] * fontSize)
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
  }

  resize()
  window.addEventListener('resize', resize)
  draw()
  rainTimer = setInterval(draw, 50)
  return () => {
    clearInterval(rainTimer)
    window.removeEventListener('resize', resize)
  }
}

onMounted(() => {
  if (hasSave) {
    player.load()
    skill.load()
    equip.load()
    achievement.load()
  }
  quoteTimer = setInterval(() => {
    let next
    do {
      next = Math.floor(Math.random() * quotes.length)
    } while (quotes[next] === currentQuote.value)
    currentQuote.value = quotes[next]
  }, 6000)
  if (rainCanvas.value) {
    initCodeRain(rainCanvas.value)
  }
})

onUnmounted(() => {
  if (quoteTimer) clearInterval(quoteTimer)
})

function startGame(reset = false) {
  if (reset || !hasSave) {
    player.reset()
    skill.reset()
    equip.reset()
    achievement.reset()
  } else {
    player.load()
    skill.load()
    equip.load()
    achievement.load()
  }
  router.push('/game')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
    <canvas ref="rainCanvas" class="absolute inset-0 w-full h-full opacity-35 pointer-events-none"></canvas>

    <div class="text-center px-6 max-w-lg relative z-10">
      <div class="text-6xl mb-2 font-mono font-bold glitch-wrapper">
        <span class="text-red-400 glitch glitch-1">Bug</span><span class="text-amber-400 glitch glitch-2">.exe</span>
      </div>
      <p class="text-slate-400 text-lg mb-1 font-mono">社畜模拟器</p>
      <p class="text-slate-500 text-sm mb-6">一个让打工人"边上班边升级"的网页 RPG</p>

      <div v-if="hasSave" class="mb-6 bg-slate-800/70 border border-slate-700 rounded-lg p-4 text-left">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-slate-300 font-bold">{{ player.name }}</span>
          <span class="text-amber-400 text-xs">{{ player.position }}</span>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>Lv.{{ player.level }}</span>
          <span>💰 ¥{{ player.money.toLocaleString() }}</span>
          <span>🏆 成就 {{ achievement.progress }}/{{ achievement.total }}</span>
          <span>💼 {{ { work: '工作中', slack: '摸鱼中', study: '学习中', overtime: '加班中', meeting: '开会中', 'paid-slack': '带薪拉屎' }[player.mode] ?? '工作中' }}</span>
        </div>
      </div>
      <div v-else class="mb-6 bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm text-slate-400 text-left leading-relaxed">
        <div class="font-bold text-slate-300 mb-1">🎯 游戏目标</div>
        <p>从实习生开始，通过工作、摸鱼、学习不断成长，逐步晋升为架构师、CTO 甚至独立开发者。</p>
        <div class="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
          <div class="bg-slate-700/50 rounded p-2">💼 工作赚钱</div>
          <div class="bg-slate-700/50 rounded p-2">📚 学习技能</div>
          <div class="bg-slate-700/50 rounded p-2">🐟 偶尔摸鱼</div>
        </div>
      </div>

      <div class="space-y-3">
        <button
          v-if="hasSave"
          @click="startGame(false)"
          class="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-lg transition cursor-pointer"
        >
          继续游戏
        </button>
        <button
          @click="startGame(!hasSave)"
          class="w-full py-3 px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-lg transition cursor-pointer"
        >
          {{ hasSave ? '新游戏' : '开始游戏' }}
        </button>
      </div>

      <div class="mt-8 text-slate-500 text-xs leading-relaxed border-t border-slate-700 pt-5">
        <div class="h-6 flex items-center justify-center">
          <span class="text-emerald-500/70 italic transition-opacity duration-500" :key="currentQuote">"{{ currentQuote }}"</span>
        </div>
        <p class="mt-3">从实习生开始，在不断工作、摸鱼、学习、</p>
        <p>加班、处理需求与线上 Bug 的过程中成长升级。</p>
        <p class="mt-2">最终成为高级开发、技术主管、架构师甚至独立开发者！</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes glitch-1 {
  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  20% { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 2px); }
  40% { clip-path: inset(50% 0 30% 0); transform: translate(3px, -1px); }
  60% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 1px); }
  80% { clip-path: inset(60% 0 20% 0); transform: translate(2px, -2px); }
}
@keyframes glitch-2 {
  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  20% { clip-path: inset(30% 0 50% 0); transform: translate(2px, -1px); }
  40% { clip-path: inset(10% 0 70% 0); transform: translate(-3px, 2px); }
  60% { clip-path: inset(60% 0 20% 0); transform: translate(1px, 1px); }
  80% { clip-path: inset(40% 0 40% 0); transform: translate(-2px, -1px); }
}
.glitch-wrapper:hover .glitch-1,
.glitch-wrapper:hover .glitch-2 {
  animation: glitch-1 0.5s infinite;
}
.glitch-wrapper:hover .glitch-2 {
  animation-name: glitch-2;
  animation-delay: 0.05s;
}
</style>
