<script setup>
import { computed } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import { useLogStore } from '@/stores/log'

const equip = useEquipmentStore()
const log = useLogStore()

const equippedList = computed(() => equip.getEquipped())

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
    <router-link
      to="/shop"
      class="block mt-2 text-xs text-amber-400 hover:text-amber-300 text-center"
    >
      前往商店 &rarr;
    </router-link>
  </div>
</template>
