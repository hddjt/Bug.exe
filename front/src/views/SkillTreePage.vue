<script setup>
import { useSkillStore } from '@/stores/skill'
import { usePlayerStore } from '@/stores/player'
import { useAchievementStore } from '@/stores/achievement'
import { useLogStore } from '@/stores/log'
import { useToastStore } from '@/stores/toast'

const skill = useSkillStore()
const player = usePlayerStore()
const achievement = useAchievementStore()
const log = useLogStore()
const toast = useToastStore()

const categories = [
  { key: 'frontend', label: '前端技能', icon: '🖥️' },
  { key: 'backend', label: '后端技能', icon: '⚙️' },
  { key: 'slack', label: '摸鱼技能', icon: '🐟' },
  { key: 'ai', label: 'AI技能', icon: '🤖' },
  { key: 'management', label: '管理技能', icon: '👔' },
]

function upgrade(skillId) {
  if (skill.upgradeSkill(skillId)) {
    const newOnes = achievement.check(player)
    newOnes.forEach(a => {
      toast.achievement(`解锁成就：${a.name}`)
      log.addLog(`🏆 解锁成就：${a.name} - ${a.desc}`, 'success')
    })
    achievement.save()
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 p-6">
    <header class="flex items-center mb-6">
      <router-link to="/game" class="text-slate-400 hover:text-white mr-4">&larr; 返回</router-link>
      <h1 class="text-2xl font-bold">技能树</h1>
      <span class="ml-auto text-amber-400 font-bold">技能点：{{ skill.skillPoints }}</span>
    </header>

    <div class="space-y-8">
      <div v-for="cat in categories" :key="cat.key" class="bg-slate-800 rounded-lg p-4">
        <h2 class="text-lg font-bold mb-3">{{ cat.icon }} {{ cat.label }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="s in skill.getSkillsByCategory(cat.key)"
            :key="s.id"
            class="bg-slate-700 rounded p-3 flex flex-col"
            :class="{ 'opacity-50': s.level === 0 && !skill.canUpgrade(s.id) }"
          >
            <div class="font-medium text-sm">{{ s.name }}</div>
            <div class="text-xs text-slate-400 mt-1">
              Lv.{{ s.level }}/{{ s.maxLevel }}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              <span v-for="(val, stat) in s.effects" :key="stat" class="mr-2">
                {{ stat }}+{{ val * (s.level + 1) }}
              </span>
            </div>
            <div v-if="s.prerequisites.length > 0" class="text-xs text-slate-500 mt-1">
              需要：{{ s.prerequisites.join(', ') }}
            </div>
            <button
              v-if="skill.canUpgrade(s.id)"
              @click="upgrade(s.id)"
              class="mt-2 py-1 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded cursor-pointer"
            >
              升级
            </button>
            <div
              v-else-if="s.level >= s.maxLevel"
              class="mt-2 py-1 px-3 bg-emerald-700 text-emerald-200 text-xs rounded text-center"
            >
              MAX
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
