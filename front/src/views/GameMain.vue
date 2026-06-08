<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLogStore } from '@/stores/log'
import { useEventStore } from '@/stores/event'
import { useSkillStore } from '@/stores/skill'
import { useEquipmentStore } from '@/stores/equipment'

import PlayerStats from '@/components/PlayerStats.vue'
import WorkPanel from '@/components/WorkPanel.vue'
import EventPanel from '@/components/EventPanel.vue'
import SkillPanel from '@/components/SkillPanel.vue'
import InventoryPanel from '@/components/InventoryPanel.vue'
import LogPanel from '@/components/LogPanel.vue'
import { useAchievementStore } from '@/stores/achievement'
import { useToastStore } from '@/stores/toast'

const player = usePlayerStore()
const log = useLogStore()
const event = useEventStore()
const skill = useSkillStore()
const equip = useEquipmentStore()
const achievement = useAchievementStore()
const toast = useToastStore()

let tickTimer = null
let eventTimer = null
let saveTimer = null

function onTick() {
  if (event.currentEvent) return
  player.tick()
  const newOnes = achievement.check(player)
  newOnes.forEach(a => {
    toast.achievement(`解锁成就：${a.name}`)
    log.addLog(`🏆 解锁成就：${a.name} - ${a.desc}`, 'success')
  })
}

function tryTriggerEvent() {
  if (event.currentEvent) return
  if (Math.random() < 0.05) {
    const evt = event.triggerRandom()
    log.addLog(`触发事件：${evt.title}`, 'event')
  }
}

onMounted(() => {
  player.load()
  skill.load()
  equip.load()

  tickTimer = setInterval(onTick, 1000)
  eventTimer = setInterval(tryTriggerEvent, 10000)
  saveTimer = setInterval(() => {
    player.save()
    skill.save()
    equip.save()
  }, 30000)
})

onUnmounted(() => {
  clearInterval(tickTimer)
  clearInterval(eventTimer)
  clearInterval(saveTimer)
  player.save()
  skill.save()
  equip.save()
})
</script>

<template>
  <div class="h-screen bg-slate-900 text-slate-200 flex flex-col overflow-hidden">
    <header class="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 shrink-0">
      <span class="font-bold text-red-400 mr-2">Bug.exe</span>
      <span class="text-xs text-slate-500">{{ player.position }} Lv.{{ player.level }}</span>
      <nav class="ml-auto space-x-2 text-sm">
        <router-link to="/game" class="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700">工作台</router-link>
        <router-link to="/skills" class="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700">技能树</router-link>
        <router-link to="/shop" class="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700">商店</router-link>
        <router-link to="/achievements" class="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700">成就</router-link>
      </nav>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <aside class="w-64 bg-slate-850 border-r border-slate-700 p-3 overflow-y-auto shrink-0">
        <PlayerStats />
      </aside>

      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 p-4 overflow-y-auto">
          <EventPanel v-if="event.currentEvent" />
          <WorkPanel v-else />
        </div>
      </main>

      <aside class="w-72 bg-slate-850 border-l border-slate-700 p-3 overflow-y-auto shrink-0">
        <SkillPanel class="mb-4" />
        <InventoryPanel />
      </aside>
    </div>

    <div class="h-36 bg-slate-800 border-t border-slate-700 shrink-0">
      <LogPanel />
    </div>
  </div>
</template>

<style>
.bg-slate-850 {
  background-color: #1a1f2e;
}
</style>
