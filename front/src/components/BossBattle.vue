<script setup>
import { useBossStore } from '@/stores/boss'

const boss = useBossStore()
</script>

<template>
  <div v-if="boss.isFighting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div class="bg-slate-800 border border-red-700/50 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
      <div class="text-center mb-4">
        <div class="text-5xl mb-2">{{ boss.active?.emoji }}</div>
        <div class="text-xl font-bold text-red-400">{{ boss.active?.name }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ boss.active?.desc }}</div>
      </div>

      <div class="space-y-3 mb-4">
        <div>
          <div class="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>👹 {{ boss.active?.name }}</span>
            <span>{{ Math.floor(boss.bossHp) }}/{{ boss.bossMaxHp }}</span>
          </div>
          <div class="h-2 bg-slate-700 rounded overflow-hidden">
            <div class="h-full bg-red-500 rounded transition-all" :style="{ width: (boss.bossHp / boss.bossMaxHp * 100) + '%' }"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>🧑‍💻 你</span>
            <span>{{ Math.floor(boss.playerHp) }}/{{ boss.playerMaxHp }}</span>
          </div>
          <div class="h-2 bg-slate-700 rounded overflow-hidden">
            <div class="h-full bg-emerald-500 rounded transition-all" :style="{ width: (boss.playerHp / boss.playerMaxHp * 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="bg-slate-900/80 rounded-lg h-24 overflow-y-auto mb-4 p-2 text-xs font-mono space-y-0.5">
        <div v-for="(line, i) in boss.battleLog.slice(-6)" :key="i" :class="{
          'text-emerald-400': line.startsWith('🎉') || line.startsWith('💥'),
          'text-red-400': line.startsWith('💀') || line.startsWith('👹'),
          'text-amber-400': line.startsWith('⚔️') || line.startsWith('🏃'),
          'text-slate-300': !line.startsWith('🎉') && !line.startsWith('💥') && !line.startsWith('💀') && !line.startsWith('👹') && !line.startsWith('⚔️') && !line.startsWith('🏃'),
        }">{{ line }}</div>
      </div>

      <div v-if="boss.bossHp > 0 && boss.playerHp > 0" class="grid grid-cols-2 gap-2">
        <button
          v-for="a in boss.ATTACK_TYPES"
          :key="a.id"
          @click="boss.playerAction(a.id)"
          class="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded cursor-pointer transition text-left"
        >
          <span class="font-bold">{{ a.name }}</span>
          <span class="text-slate-500 ml-1">{{ a.desc }}</span>
        </button>
        <button
          @click="boss.flee()"
          class="py-2 px-3 bg-slate-700 hover:bg-red-900/50 text-slate-400 hover:text-red-400 text-xs rounded cursor-pointer transition col-span-2"
        >
          🏃 逃跑
        </button>
      </div>

      <div v-else class="text-center text-sm text-slate-400">
        {{ boss.bossHp <= 0 ? '🎉 战斗结束！' : '💀 你被击败了...' }}
      </div>
    </div>
  </div>
</template>
