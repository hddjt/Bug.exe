<script setup>
import { useChallengeStore } from '@/stores/challenge'
import { useLogStore } from '@/stores/log'
import { useToastStore } from '@/stores/toast'

const challenge = useChallengeStore()
const log = useLogStore()
const toast = useToastStore()

function claim(id) {
  const pts = challenge.claim(id)
  if (pts) {
    toast.success(`挑战完成！获得 ${pts} 技能点`)
    log.addLog(`🏆 完成挑战，获得 ${pts} 技能点`, 'success')
  }
}
</script>

<template>
  <div class="mt-4 pt-3 border-t border-slate-700">
    <h3 class="text-sm font-bold text-slate-300 mb-2">🎯 每日挑战</h3>
    <div class="space-y-2">
      <div
        v-for="c in challenge.activeChallenges"
        :key="c.id"
        class="text-xs bg-slate-700/50 rounded px-2 py-1.5"
      >
        <div class="flex justify-between items-center">
          <span class="text-slate-300">{{ c.name }}</span>
          <span class="text-amber-400">+{{ c.reward }} 技能点</span>
        </div>
        <div class="text-[10px] text-slate-500">{{ c.desc }}</div>
        <button
          v-if="challenge.canClaim(c.id)"
          @click="claim(c.id)"
          class="mt-1 w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] rounded cursor-pointer transition"
        >
          领取奖励
        </button>
      </div>
      <div v-if="challenge.activeChallenges.length === 0" class="text-xs text-emerald-400 text-center py-1">
        ✨ 今日所有挑战已完成！
      </div>
    </div>
  </div>
</template>
