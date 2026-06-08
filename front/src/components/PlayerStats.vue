<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useEquipmentStore } from '@/stores/equipment'

const player = usePlayerStore()
const equip = useEquipmentStore()
const showStats = ref(false)

const equipBonuses = computed(() => {
  const bonuses = {}
  for (const itemId of Object.values(equip.equipped)) {
    const item = equip.shopItems.find(i => i.id === itemId)
    if (item) {
      for (const [stat, val] of Object.entries(item.effects)) {
        bonuses[stat] = (bonuses[stat] || 0) + val
      }
    }
  }
  return bonuses
})
</script>

<template>
  <div class="space-y-4">
    <div class="text-center">
      <div class="text-lg font-bold text-slate-100">{{ player.name }}</div>
      <div class="text-xs text-amber-400">{{ player.position }}</div>
      <div class="text-xs text-slate-400">
        Lv.{{ player.level }}
        <span class="text-emerald-400">¥{{ player.money.toLocaleString() }}</span>
      </div>
      <div class="text-xs mt-1" :class="{
        'text-emerald-400': player.dailyLuck >= 3,
        'text-amber-400': player.dailyLuck === 2,
        'text-slate-400': player.dailyLuck < 2,
      }">
        🎲 今日 {{ player.dailyLuckLabel }}
      </div>
    </div>

    <div class="space-y-2 text-xs">
      <div>
        <div class="flex justify-between text-slate-400 mb-0.5">
          <span>EXP</span>
          <span>{{ Math.floor(player.exp) }}/{{ player.expToNext }}</span>
        </div>
        <div class="h-1.5 bg-slate-700 rounded overflow-hidden">
          <div class="h-full bg-amber-500 rounded transition-all" :style="{ width: (player.exp / player.expToNext * 100) + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-slate-400 mb-0.5">
          <span>体力</span>
          <span>{{ Math.floor(player.energy) }}/{{ player.maxEnergy }}</span>
        </div>
        <div class="h-1.5 bg-slate-700 rounded overflow-hidden">
          <div class="h-full bg-green-500 rounded transition-all" :style="{ width: (player.energy / player.maxEnergy * 100) + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-slate-400 mb-0.5">
          <span>精神</span>
          <span>{{ Math.floor(player.san) }}/{{ player.maxSan }}</span>
        </div>
        <div class="h-1.5 bg-slate-700 rounded overflow-hidden">
          <div class="h-full bg-purple-500 rounded transition-all" :style="{ width: (player.san / player.maxSan * 100) + '%' }"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-slate-400 mb-0.5">
          <span>快乐</span>
          <span>{{ Math.floor(player.happiness) }}/100</span>
        </div>
        <div class="h-1.5 bg-slate-700 rounded overflow-hidden">
          <div class="h-full bg-pink-500 rounded transition-all" :style="{ width: player.happiness + '%' }"></div>
        </div>
      </div>

      <div class="pt-2 border-t border-slate-700">
        <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-400">
          <span>技术力: <span class="text-slate-200">{{ player.tech.toFixed(1) }}</span></span>
          <span>代码: <span class="text-slate-200">{{ player.coding.toFixed(1) }}</span></span>
          <span>Debug: <span class="text-slate-200">{{ player.debug.toFixed(1) }}</span></span>
          <span>架构: <span class="text-slate-200">{{ player.architecture.toFixed(1) }}</span></span>
          <span>学习: <span class="text-slate-200">{{ player.learning.toFixed(1) }}</span></span>
          <span>运气: <span class="text-slate-200">{{ player.luck.toFixed(1) }}</span></span>
        </div>
      </div>

      <div class="pt-2 border-t border-slate-700">
        <div class="grid grid-cols-3 gap-x-2 gap-y-1 text-slate-400 text-xs">
          <span>同事: {{ Math.floor(player.colleagueRelation) }}</span>
          <span>老板: {{ Math.floor(player.bossRelation) }}</span>
          <span>产品: {{ Math.floor(player.productRelation) }}</span>
        </div>
      </div>

      <div v-if="Object.keys(equipBonuses).length > 0" class="pt-1 text-[10px] text-emerald-500/80">
        <span>装备加成: </span>
        <span v-for="(val, stat) in equipBonuses" :key="stat" class="mr-1">{{ stat }}+{{ val }}</span>
      </div>

      <div class="pt-2 border-t border-slate-700 text-center">
        <div v-if="player.nextPosition" class="text-xs text-slate-500">
          <span>下一职位: {{ player.nextPosition.name }} (Lv.{{ player.nextPosition.level }})</span>
          <div class="h-1 bg-slate-700 rounded overflow-hidden mt-1">
            <div class="h-full bg-amber-500 rounded transition-all" :style="{ width: Math.min(player.level / player.nextPosition.level * 100, 100) + '%' }"></div>
          </div>
        </div>
        <div v-else class="text-xs text-emerald-500">已达最终职位 🏆</div>
        <div class="text-xs text-slate-500 mt-1">薪资: ¥{{ player.salary.toLocaleString() }}/月</div>
      </div>

      <button
        @click="showStats = !showStats"
        class="w-full mt-2 py-1 text-xs text-slate-500 hover:text-slate-300 bg-slate-700/50 rounded cursor-pointer"
      >
        {{ showStats ? '收起统计' : '展开统计' }}
      </button>

      <div v-if="showStats" class="pt-2 border-t border-slate-700 space-y-1 text-xs text-slate-400">
        <div class="font-bold text-slate-300 mb-1">生涯统计</div>
        <div>修 Bug: {{ player.totalBugsFixed }} 次</div>
        <div>累计收入: ¥{{ player.totalMoneyEarned.toLocaleString() }}</div>
        <div>经历事件: {{ player.totalEvents }} 次</div>
        <div>晋升次数: {{ player.promotions }} 次</div>
        <div>学会技能: {{ player.skillsLearned }} 个</div>
        <div>累计加班: {{ player.totalOvertime }} 次</div>
      </div>
    </div>
  </div>
</template>
