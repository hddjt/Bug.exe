<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useSkillStore } from '@/stores/skill'
import { useEquipmentStore } from '@/stores/equipment'

const router = useRouter()
const player = usePlayerStore()
const skill = useSkillStore()
const equip = useEquipmentStore()

const hasSave = !!localStorage.getItem('bug-exe-player')

function startGame(reset = false) {
  if (reset || !hasSave) {
    player.reset()
    skill.reset()
    equip.reset()
  } else {
    player.load()
    skill.load()
    equip.load()
  }
  router.push('/game')
}

onMounted(() => {
  player.load()
  skill.load()
  equip.load()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
    <div class="text-center px-6 max-w-lg">
      <div class="text-6xl mb-2 font-mono font-bold">
        <span class="text-red-400">Bug</span><span class="text-amber-400">.exe</span>
      </div>
      <p class="text-slate-400 text-lg mb-1 font-mono">社畜模拟器</p>
      <p class="text-slate-500 text-sm mb-8">一个让打工人"边上班边升级"的网页 RPG</p>

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

      <div class="mt-10 text-slate-500 text-xs leading-relaxed border-t border-slate-700 pt-6">
        <p>从实习生开始，在不断工作、摸鱼、学习、</p>
        <p>加班、处理需求与线上 Bug 的过程中成长升级。</p>
        <p class="mt-2">最终成为高级开发、技术主管、架构师甚至独立开发者！</p>
      </div>
    </div>
  </div>
</template>
