<script setup>
import { useEventStore } from '@/stores/event'
import { usePlayerStore } from '@/stores/player'
import { useLogStore } from '@/stores/log'
import { useAchievementStore } from '@/stores/achievement'
import { useToastStore } from '@/stores/toast'

const event = useEventStore()
const player = usePlayerStore()
const log = useLogStore()
const achievement = useAchievementStore()
const toast = useToastStore()

function selectOption(index) {
  const evt = event.currentEvent
  if (!evt) return
  const option = evt.options[index]
  if (option) {
    player.totalEvents++
    if (evt.id === 'overtime' && index === 0) {
      player.totalOvertime++
    }
    if (option.effects.money) {
      player.addMoney(option.effects.money)
    }
    player.applyEventEffects(option.effects)
    log.addLog(`${evt.title} - 选择了：${option.text}`, 'event')
    const newOnes = achievement.check(player)
    newOnes.forEach(a => {
      toast.achievement(`解锁成就：${a.name}`)
      log.addLog(`🏆 解锁成就：${a.name} - ${a.desc}`, 'success')
    })
    achievement.save()
    event.dismiss()
  }
}
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div v-if="event.currentEvent" class="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-amber-600/50 shadow-lg shadow-amber-900/20">
      <div class="text-lg font-bold text-amber-400 mb-1">{{ event.currentEvent.title }}</div>
      <div class="text-sm text-slate-300 mb-4">{{ event.currentEvent.description }}</div>
      <div class="space-y-2">
        <button
          v-for="(opt, idx) in event.currentEvent.options"
          :key="idx"
          @click="selectOption(idx)"
          class="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded text-left cursor-pointer transition"
        >
          {{ opt.text }}
        </button>
      </div>
    </div>
  </div>
</template>
