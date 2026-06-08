<script setup>
import { computed } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import { usePlayerStore } from '@/stores/player'
import { useLogStore } from '@/stores/log'

const equip = useEquipmentStore()
const player = usePlayerStore()
const log = useLogStore()

const categories = [
  { key: 'computer', label: '电脑设备', icon: '💻' },
  { key: 'peripheral', label: '外设', icon: '⌨️' },
  { key: 'consumable', label: '消耗品', icon: '☕' },
  { key: 'ai', label: 'AI装备', icon: '🤖' },
]

function buy(itemId) {
  const item = equip.shopItems.find(i => i.id === itemId)
  if (equip.buyItem(itemId)) {
    log.addLog(`购买了 ${item.name}，花费 ¥${item.price}`, 'success')
  } else {
    log.addLog(`购买 ${item.name} 失败，余额不足`, 'error')
  }
}

function sell(itemId) {
  const item = equip.shopItems.find(i => i.id === itemId)
  if (!item || item.price === 0) return
  const price = equip.sellItem(itemId)
  if (price) {
    log.addLog(`出售了 ${item.name}，获得 ¥${price}`, 'info')
  }
}

function ownedQty(itemId) {
  const inv = equip.inventory.find(i => i.id === itemId)
  return inv ? inv.quantity : 0
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 p-6">
    <header class="flex items-center mb-6">
      <router-link to="/game" class="text-slate-400 hover:text-white mr-4">&larr; 返回</router-link>
      <h1 class="text-2xl font-bold">商店</h1>
      <span class="ml-auto text-amber-400 font-bold">¥{{ player.money.toLocaleString() }}</span>
    </header>

    <div class="space-y-8">
      <div v-for="cat in categories" :key="cat.key" class="bg-slate-800 rounded-lg p-4">
        <h2 class="text-lg font-bold mb-3">{{ cat.icon }} {{ cat.label }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="item in equip.getShopItemsByCategory(cat.key)"
            :key="item.id"
            class="bg-slate-700 rounded p-3 flex flex-col"
          >
            <div class="font-medium text-sm">{{ item.name }}</div>
            <div class="text-xs text-slate-400 mt-1">
              <span v-for="(val, stat) in item.effects" :key="stat" class="mr-1">
                {{ stat }}+{{ val }}
              </span>
              <span v-if="Object.keys(item.effects).length === 0" class="text-slate-500">无属性加成</span>
            </div>
            <div class="text-xs text-amber-400 mt-1">¥{{ item.price.toLocaleString() }}</div>
            <div v-if="ownedQty(item.id) > 0" class="text-xs text-slate-500 mt-1">持有: {{ ownedQty(item.id) }}</div>
            <div class="flex gap-1 mt-2">
              <button
                @click="buy(item.id)"
                :disabled="player.money < item.price || item.price === 0"
                class="flex-1 py-1 px-2 text-xs rounded cursor-pointer transition disabled:cursor-not-allowed"
                :class="item.price === 0 ? 'bg-slate-600 text-slate-400' : 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-white'"
              >
                {{ item.price === 0 ? '已拥有' : '购买' }}
              </button>
              <button
                v-if="ownedQty(item.id) > 0 && item.price > 0"
                @click="sell(item.id)"
                class="py-1 px-2 bg-red-700 hover:bg-red-600 text-white text-xs rounded cursor-pointer transition"
              >
                回收 ¥{{ Math.floor(item.price * 0.5) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
