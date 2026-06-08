<script setup>
import { computed } from 'vue'
import { useAchievementStore } from '@/stores/achievement'

const achievement = useAchievementStore()

const unlockedList = computed(() => achievement.getUnlocked())
const lockedList = computed(() => achievement.getLocked())
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 p-6">
    <header class="flex items-center mb-6">
      <router-link to="/game" class="text-slate-400 hover:text-white mr-4">&larr; 返回</router-link>
      <h1 class="text-2xl font-bold">成就</h1>
      <span class="ml-auto text-amber-400 font-bold">{{ achievement.progress }}/{{ achievement.total }}</span>
    </header>

    <div class="mb-6">
      <div class="h-2 bg-slate-700 rounded overflow-hidden">
        <div class="h-full bg-amber-500 rounded transition-all" :style="{ width: (achievement.progress / achievement.total * 100) + '%' }"></div>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-bold text-emerald-400 mb-3">已解锁 ({{ unlockedList.length }})</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="a in unlockedList"
            :key="a.id"
            class="bg-slate-800 rounded-lg p-4 border border-emerald-700/50"
          >
            <div class="font-bold text-emerald-300">🏆 {{ a.name }}</div>
            <div class="text-xs text-slate-400 mt-1">{{ a.desc }}</div>
          </div>
        </div>
        <div v-if="unlockedList.length === 0" class="text-slate-500 text-sm">还没有解锁任何成就</div>
      </div>

      <div>
        <h2 class="text-lg font-bold text-slate-400 mb-3">未解锁 ({{ lockedList.length }})</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="a in lockedList"
            :key="a.id"
            class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 opacity-60"
          >
            <div class="font-bold text-slate-500">🔒 {{ a.name }}</div>
            <div class="text-xs text-slate-600 mt-1">{{ a.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
