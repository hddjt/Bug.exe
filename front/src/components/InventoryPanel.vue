<script setup>
import { computed, ref } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import { useLogStore } from '@/stores/log'
import { usePlayerStore } from '@/stores/player'
import { useSkillStore } from '@/stores/skill'
import { useAchievementStore } from '@/stores/achievement'
import { useToastStore } from '@/stores/toast'

const equip = useEquipmentStore()
const log = useLogStore()
const player = usePlayerStore()
const skill = useSkillStore()
const achievement = useAchievementStore()
const toast = useToastStore()

const equippedList = computed(() => equip.getEquipped())
const showResetConfirm = ref(false)

function useItem(itemId) {
  const item = equip.shopItems.find(i => i.id === itemId)
  if (equip.useConsumable(itemId)) {
    log.addLog(`使用了 ${item.name}`, 'info')
  }
}

function equipItem(itemId) {
  const item = equip.shopItems.find(i => i.id === itemId)
  if (equip.equipItem(itemId)) {
    log.addLog(`装备了 ${item.name}`, 'success')
  }
}

function unequipItem(itemId) {
  const item = equip.shopItems.find(i => i.id === itemId)
  if (equip.unequipItem(itemId)) {
    log.addLog(`卸下了 ${item.name}`, 'info')
  }
}

function manualSave() {
  player.save()
  skill.save()
  equip.save()
  achievement.save()
  toast.success('游戏已存档')
  log.addLog('手动存档成功', 'success')
}

function confirmReset() {
  showResetConfirm.value = true
}

function doReset() {
  player.reset()
  skill.reset()
  equip.reset()
  achievement.reset()
  localStorage.removeItem('bug-exe-daily-tasks')
  showResetConfirm.value = false
  toast.info('游戏已重置')
  log.addLog('游戏数据已重置', 'info')
}
</script>

<template>
  <div>
    <h3 class="text-sm font-bold text-slate-300 mb-2">已装备</h3>
    <div class="space-y-1 mb-3">
      <div
        v-for="(item, category) in equippedList"
        :key="category"
        class="flex justify-between items-center text-xs bg-emerald-900/30 border border-emerald-700/30 rounded px-2 py-1"
      >
        <span class="text-emerald-300">{{ item.name }}</span>
        <button
          @click="unequipItem(item.id)"
          class="text-red-400 hover:text-red-300 cursor-pointer"
        >
          卸下
        </button>
      </div>
      <div v-if="Object.keys(equippedList).length === 0" class="text-xs text-slate-500 text-center py-1">
        未装备任何物品
      </div>
    </div>

    <h3 class="text-sm font-bold text-slate-300 mb-2">背包</h3>
    <div class="space-y-1">
      <div
        v-for="inv in equip.inventory"
        :key="inv.id"
        class="flex justify-between items-center text-xs bg-slate-700 rounded px-2 py-1"
      >
        <span class="text-slate-300">
          {{ equip.getItemInfo(inv.id)?.name ?? inv.id }}
          <span v-if="inv.quantity > 1" class="text-slate-500">x{{ inv.quantity }}</span>
        </span>
        <div class="flex gap-1">
          <button
            v-if="equip.getItemInfo(inv.id)?.category === 'consumable'"
            @click="useItem(inv.id)"
            class="text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            使用
          </button>
          <button
            v-else-if="equip.isEquippable(inv.id) && equip.equipped[equip.shopItems.find(i => i.id === inv.id)?.category] !== inv.id"
            @click="equipItem(inv.id)"
            class="text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            装备
          </button>
          <span
            v-else-if="equip.isEquippable(inv.id)"
            class="text-emerald-500"
          >
            已装备
          </span>
        </div>
      </div>
      <div v-if="equip.inventory.length === 0" class="text-xs text-slate-500 text-center py-2">
        背包空空如也
      </div>
    </div>

    <div class="mt-3 pt-3 border-t border-slate-700 flex gap-2">
      <button
        @click="manualSave"
        class="flex-1 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded cursor-pointer transition"
      >
        💾 存档
      </button>
      <button
        @click="confirmReset"
        class="flex-1 py-1.5 text-xs bg-red-900/50 hover:bg-red-800/50 text-red-400 rounded cursor-pointer transition"
      >
        🔄 重置
      </button>
    </div>

    <router-link
      to="/shop"
      class="block mt-2 text-xs text-amber-400 hover:text-amber-300 text-center"
    >
      前往商店 &rarr;
    </router-link>

    <div v-if="showResetConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="showResetConfirm = false">
      <div class="bg-slate-800 border border-red-700 rounded-lg p-5 max-w-xs mx-4 shadow-2xl">
        <div class="text-lg font-bold text-red-400 mb-2">⚠️ 确认重置</div>
        <p class="text-sm text-slate-300 mb-4">所有游戏数据将被清除，此操作不可撤销！</p>
        <div class="flex gap-3">
          <button @click="showResetConfirm = false" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm cursor-pointer transition">取消</button>
          <button @click="doReset" class="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm cursor-pointer transition font-bold">确认重置</button>
        </div>
      </div>
    </div>
  </div>
</template>
