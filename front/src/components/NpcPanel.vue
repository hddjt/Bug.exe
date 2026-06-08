<script setup>
import { useNpcStore } from '@/stores/npc'
import { useLogStore } from '@/stores/log'

const npc = useNpcStore()
const log = useLogStore()

function chat(npcId) {
  const dialogue = npc.chat(npcId)
  if (dialogue) {
    const n = npc.getNpc(npcId)
    log.addLog(`${n.emoji} ${n.name}: "${dialogue}"`, 'info')
    window.__challengeTrack?.('chat')
  }
}

function relationColor(val) {
  if (val >= 70) return 'text-emerald-400'
  if (val >= 40) return 'text-slate-400'
  return 'text-red-400'
}
</script>

<template>
  <div>
    <h3 class="text-sm font-bold text-slate-300 mb-2">🧑‍🤝‍🧑 同事</h3>
    <div class="space-y-1">
      <div
        v-for="n in npc.npcs"
        :key="n.id"
        class="flex items-center gap-2 bg-slate-700 rounded px-2 py-1.5 text-xs cursor-pointer hover:bg-slate-600 transition"
        :class="{ 'opacity-50 pointer-events-none': npc.chatCooldown }"
        @click="chat(n.id)"
      >
        <span class="text-base">{{ n.emoji }}</span>
        <div class="flex-1 min-w-0">
          <div class="text-slate-200 truncate">{{ n.name }}</div>
          <div class="text-[10px] text-slate-500 truncate">{{ n.role }}</div>
        </div>
        <span class="text-[10px]" :class="relationColor(n.relation)">{{ n.relation }}</span>
      </div>
    </div>
  </div>
</template>
