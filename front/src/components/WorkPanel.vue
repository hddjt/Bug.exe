<script setup>
import { usePlayerStore } from '@/stores/player'
import { useLogStore } from '@/stores/log'
import { useAchievementStore } from '@/stores/achievement'
import { useToastStore } from '@/stores/toast'

const player = usePlayerStore()
const log = useLogStore()
const achievement = useAchievementStore()
const toast = useToastStore()

const modes = [
  { key: 'work', label: '💼 工作模式', desc: '经验↑ 工资↑ 快乐↓' },
  { key: 'slack', label: '🐟 摸鱼模式', desc: '快乐↑ 经验↓' },
  { key: 'study', label: '📚 学习模式', desc: '成长↑↑ 工资↓' },
]

function checkAchievements() {
  const newOnes = achievement.check(player)
  newOnes.forEach(a => {
    toast.achievement(`解锁成就：${a.name}`)
    log.addLog(`🏆 解锁成就：${a.name} - ${a.desc}`, 'success')
  })
  achievement.save()
}

function switchMode(mode) {
  player.changeMode(mode)
  log.addLog(`切换至${modes.find(m => m.key === mode).label}`, 'info')
}

function doWork() {
  player.addExp(5 + player.coding / 2)
  player.addMoney(Math.floor(player.salary / 5000) + 1)
  player.san = Math.max(0, player.san - 1)
  log.addLog('完成一次工作任务，经验+5', 'work')
  checkAchievements()
}

function fixBug() {
  const success = (player.tech * player.luck / 100) + Math.random() * 0.5
  if (success > 0.5) {
    player.addExp(15)
    player.debug += 0.5
    player.addMoney(200)
    player.totalBugsFixed++
    log.addLog('修复了一个 Bug！经验+15', 'success')
  } else {
    player.san -= 5
    log.addLog('修 Bug 失败...精神-5', 'error')
  }
  checkAchievements()
}
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center space-y-6">
    <div class="text-center">
      <div class="text-2xl font-bold mb-1">
        {{ modes.find(m => m.key === player.mode)?.label ?? '工作中' }}
      </div>
      <div class="text-sm text-slate-400">
        {{ modes.find(m => m.key === player.mode)?.desc ?? '' }}
      </div>
    </div>

    <div class="flex gap-2">
      <button
        v-for="m in modes"
        :key="m.key"
        @click="switchMode(m.key)"
        class="px-4 py-2 rounded text-sm cursor-pointer transition"
        :class="player.mode === m.key ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
      >
        {{ m.label }}
      </button>
    </div>

    <div class="flex gap-3">
      <button
        @click="doWork"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold cursor-pointer transition"
      >
        完成需求
      </button>
      <button
        @click="fixBug"
        class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold cursor-pointer transition"
      >
        修 Bug
      </button>
    </div>

    <div class="text-xs text-slate-500 mt-4">
      挂机中：每秒自动获得 {{ player.mode }} 收益
    </div>
  </div>
</template>
