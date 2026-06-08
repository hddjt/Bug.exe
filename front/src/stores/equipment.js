import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePlayerStore } from './player'

const EQUIPPABLE_CATEGORIES = ['computer', 'peripheral', 'ai']

const CATEGORY_LABELS = {
  computer: '电脑设备',
  peripheral: '外设',
  consumable: '消耗品',
  ai: 'AI装备',
}

const SHOP_ITEMS = [
  { id: 'normal-pc', name: '普通电脑', category: 'computer', price: 0, effects: {} },
  { id: 'gaming-laptop', name: '游戏本', category: 'computer', price: 5000, effects: { coding: 1, tech: 1 } },
  { id: 'dual-monitor', name: '双屏显示器', category: 'computer', price: 8000, effects: { coding: 2, debug: 2 } },
  { id: 'macbook', name: 'MacBook Pro', category: 'computer', price: 15000, effects: { coding: 3, tech: 2, happiness: 5 } },
  { id: 'workstation', name: '4090工作站', category: 'computer', price: 30000, effects: { coding: 5, tech: 5, debug: 3 } },
  { id: 'mini-pc', name: 'Mini PC', category: 'computer', price: 3000, effects: { coding: 1 } },
  { id: 'surface-pro', name: 'Surface Pro', category: 'computer', price: 10000, effects: { coding: 2, tech: 2, happiness: 3 } },
  { id: 'imac', name: 'iMac', category: 'computer', price: 25000, effects: { coding: 4, tech: 3, debug: 2, happiness: 3 } },
  { id: 'mech-keyboard', name: '机械键盘', category: 'peripheral', price: 1000, effects: { coding: 1 } },
  { id: 'ergo-mouse', name: '人体工学鼠标', category: 'peripheral', price: 500, effects: { coding: 1, happiness: 2 } },
  { id: 'noise-headphones', name: '降噪耳机', category: 'peripheral', price: 2000, effects: { san: 5, happiness: 3 } },
  { id: '4k-monitor', name: '4K显示器', category: 'peripheral', price: 4000, effects: { coding: 2, happiness: 2 } },
  { id: 'ergo-chair', name: '人体工学椅', category: 'peripheral', price: 3000, effects: { san: 5, energy: 5 } },
  { id: 'standing-desk', name: '升降桌', category: 'peripheral', price: 5000, effects: { energy: 5, happiness: 3 } },
  { id: 'eye-lamp', name: '护眼台灯', category: 'peripheral', price: 300, effects: { san: 3 } },
  { id: 'nap-pillow', name: '午睡枕', category: 'peripheral', price: 100, effects: { energy: 10 } },
  { id: 'coffee', name: '咖啡', category: 'consumable', price: 30, effects: { energy: 30, san: 10 } },
  { id: 'red-bull', name: '红牛', category: 'consumable', price: 15, effects: { coding: 2, san: -3 } },
  { id: 'bubble-tea', name: '奶茶', category: 'consumable', price: 25, effects: { happiness: 10, energy: 10 } },
  { id: 'soda', name: '快乐水', category: 'consumable', price: 8, effects: { happiness: 5, energy: 5 } },
  { id: 'energy-drink', name: '功能饮料', category: 'consumable', price: 20, effects: { energy: 20, san: -2 } },
  { id: 'snack-box', name: '零食大礼包', category: 'consumable', price: 50, effects: { happiness: 15 } },
  { id: 'melatonin', name: '褪黑素', category: 'consumable', price: 60, effects: { san: 20, energy: 10 } },
  { id: 'copilot-pro', name: 'Copilot Pro', category: 'ai', price: 10000, effects: { debug: 3, coding: 2 } },
  { id: 'cursor-pro', name: 'Cursor Pro', category: 'ai', price: 12000, effects: { coding: 4, debug: 2 } },
  { id: 'claude', name: 'Claude', category: 'ai', price: 14000, effects: { coding: 5, learning: 3 } },
]

export const useEquipmentStore = defineStore('equipment', () => {
  const inventory = ref([])
  const equipped = ref({})

  const shopItems = ref(SHOP_ITEMS)

  const categories = computed(() => CATEGORY_LABELS)

  function isEquippable(itemId) {
    const item = shopItems.value.find(i => i.id === itemId)
    return item && EQUIPPABLE_CATEGORIES.includes(item.category)
  }

  function equipItem(itemId) {
    const inv = inventory.value.find(i => i.id === itemId)
    if (!inv) return false
    const item = shopItems.value.find(i => i.id === itemId)
    if (!item || !EQUIPPABLE_CATEGORIES.includes(item.category)) return false
    const player = usePlayerStore()
    const current = equipped.value[item.category]
    if (current) {
      unequipItem(current)
    }
    equipped.value[item.category] = itemId
    player.useItem(item.effects)
    return true
  }

  function unequipItem(itemId) {
    const item = shopItems.value.find(i => i.id === itemId)
    if (!item) return false
    const player = usePlayerStore()
    for (const [stat, val] of Object.entries(item.effects)) {
      if (player[stat] !== undefined) {
        player[stat] = Math.max(0, player[stat] - val)
      }
    }
    if (equipped.value[item.category] === itemId) {
      delete equipped.value[item.category]
    }
    return true
  }

  function getEquipped() {
    const result = {}
    for (const [category, itemId] of Object.entries(equipped.value)) {
      result[category] = shopItems.value.find(i => i.id === itemId)
    }
    return result
  }

  function getShopItemsByCategory(category) {
    return shopItems.value.filter(i => i.category === category)
  }

  function buyItem(itemId) {
    const item = shopItems.value.find(i => i.id === itemId)
    if (!item) return false
    const player = usePlayerStore()
    if (player.money < item.price) return false
    player.money -= item.price
    const existing = inventory.value.find(i => i.id === itemId)
    if (existing) {
      existing.quantity++
    } else {
      inventory.value.push({ id: itemId, quantity: 1 })
    }
    return true
  }

  function useConsumable(itemId) {
    const inv = inventory.value.find(i => i.id === itemId)
    if (!inv) return false
    const item = shopItems.value.find(i => i.id === itemId)
    if (!item || item.category !== 'consumable') return false
    const player = usePlayerStore()
    player.useItem(item.effects)
    inv.quantity--
    if (inv.quantity <= 0) {
      inventory.value = inventory.value.filter(i => i.id !== itemId)
    }
    return true
  }

  function getItemInfo(itemId) {
    const item = shopItems.value.find(i => i.id === itemId)
    const inv = inventory.value.find(i => i.id === itemId)
    return { ...item, quantity: inv?.quantity ?? 0 }
  }

  const SAVE_KEY = 'bug-exe-equipment'

  function save() {
    const data = {
      inventory: inventory.value,
      equipped: equipped.value,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      inventory.value = data.inventory ?? []
      equipped.value = data.equipped ?? {}
    } catch { /* ignore */ }
  }

  function reset() {
    inventory.value = []
    equipped.value = {}
    localStorage.removeItem(SAVE_KEY)
  }

  return {
    inventory, equipped, shopItems, categories,
    getShopItemsByCategory, buyItem, useConsumable, getItemInfo,
    isEquippable, equipItem, unequipItem, getEquipped,
    save, load, reset,
  }
})
