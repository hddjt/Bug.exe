<script setup>
import { computed } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { usePlayerStore } from '@/stores/player'

const analytics = useAnalyticsStore()
const player = usePlayerStore()

const report = computed(() => analytics.generateWeeklyReport())

function barWidth(val, max) {
  return Math.min(val / max * 100, 100)
}

function maxVal(arr) {
  return Math.max(...arr.map(h => h.value), 1)
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 p-6">
    <header class="flex items-center mb-6">
      <router-link to="/game" class="text-slate-400 hover:text-white mr-4">&larr; 返回</router-link>
      <h1 class="text-2xl font-bold">📊 数据分析</h1>
    </header>

    <div class="max-w-2xl space-y-6">
      <div class="bg-slate-800 rounded-lg p-5 border border-amber-700/30">
        <div class="text-lg font-bold text-amber-400 mb-1">{{ report.title }}</div>
        <div class="text-xs text-slate-500 mb-4">{{ report.employee }} · {{ report.position }} · 周{{ report.day }}</div>

        <div class="grid grid-cols-3 gap-3 text-center mb-4">
          <div class="bg-slate-700/50 rounded p-2">
            <div class="text-lg font-bold text-emerald-400">{{ report.bugsFixed }}</div>
            <div class="text-[10px] text-slate-500">修 Bug</div>
          </div>
          <div class="bg-slate-700/50 rounded p-2">
            <div class="text-lg font-bold text-amber-400">{{ report.overtime }}</div>
            <div class="text-[10px] text-slate-500">加班次数</div>
          </div>
          <div class="bg-slate-700/50 rounded p-2">
            <div class="text-lg font-bold text-blue-400">{{ report.skillsLearned }}</div>
            <div class="text-[10px] text-slate-500">新技能</div>
          </div>
        </div>

        <div class="text-sm text-slate-300 italic">"{{ report.verdict }}"</div>
      </div>

      <div class="bg-slate-800 rounded-lg p-5">
        <h2 class="font-bold text-slate-300 mb-3">📈 等级成长</h2>
        <div v-if="analytics.levelHistory.length > 1" class="space-y-1">
          <div v-for="(h, i) in analytics.levelHistory.slice(-10)" :key="i" class="flex items-center gap-2 text-xs">
            <span class="text-slate-500 w-12 shrink-0">{{ h.label }}</span>
            <div class="flex-1 bg-slate-700 h-4 rounded overflow-hidden relative">
              <div class="h-full bg-amber-500 rounded transition-all" :style="{ width: barWidth(h.value, maxVal(analytics.levelHistory)) + '%' }"></div>
            </div>
            <span class="text-slate-300 w-6 text-right">Lv.{{ h.value }}</span>
          </div>
        </div>
        <div v-else class="text-sm text-slate-500">数据不足，继续游戏生成成长曲线</div>
      </div>

      <div class="bg-slate-800 rounded-lg p-5">
        <h2 class="font-bold text-slate-300 mb-3">💰 资产成长</h2>
        <div v-if="analytics.moneyHistory.length > 1" class="space-y-1">
          <div v-for="(h, i) in analytics.moneyHistory.slice(-10)" :key="i" class="flex items-center gap-2 text-xs">
            <span class="text-slate-500 w-12 shrink-0">{{ h.label }}</span>
            <div class="flex-1 bg-slate-700 h-4 rounded overflow-hidden relative">
              <div class="h-full bg-emerald-500 rounded transition-all" :style="{ width: barWidth(h.value, maxVal(analytics.moneyHistory)) + '%' }"></div>
            </div>
            <span class="text-slate-300 w-16 text-right">¥{{ h.value.toLocaleString() }}</span>
          </div>
        </div>
        <div v-else class="text-sm text-slate-500">数据不足，继续游戏生成成长曲线</div>
      </div>

      <div class="bg-slate-800 rounded-lg p-5">
        <h2 class="font-bold text-slate-300 mb-3">🆚 属性雷达</h2>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="stat in [
            { label: '技术力', val: player.tech, max: 50, color: 'bg-blue-500' },
            { label: '代码能力', val: player.coding, max: 50, color: 'bg-emerald-500' },
            { label: 'Debug', val: player.debug, max: 50, color: 'bg-red-500' },
            { label: '架构能力', val: player.architecture, max: 50, color: 'bg-purple-500' },
            { label: '学习能力', val: player.learning, max: 50, color: 'bg-amber-500' },
            { label: '运气', val: player.luck, max: 50, color: 'bg-pink-500' },
          ]" :key="stat.label" class="text-center">
            <div class="text-lg font-bold" :class="stat.color.replace('bg-', 'text-')">{{ stat.val.toFixed(1) }}</div>
            <div class="text-[10px] text-slate-500">{{ stat.label }}</div>
            <div class="h-1.5 bg-slate-700 rounded overflow-hidden mt-1">
              <div class="h-full rounded transition-all" :class="stat.color" :style="{ width: Math.min(stat.val / stat.max * 100, 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
