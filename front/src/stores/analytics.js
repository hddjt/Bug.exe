import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePlayerStore } from './player'
import { saveWithVersion, loadWithVersion, removeStorage } from './helpers'

export const useAnalyticsStore = defineStore('analytics', () => {
  const history = ref([])
  const lastSnapshot = ref(0)

  function snapshot() {
    const player = usePlayerStore()
    const now = Date.now()
    if (now - lastSnapshot.value < 60000) return
    lastSnapshot.value = now
    history.value.push({
      time: now,
      level: player.level,
      money: player.money,
      tech: player.tech,
      coding: player.coding,
      debug: player.debug,
      san: player.san,
      happiness: player.happiness,
    })
    if (history.value.length > 100) {
      history.value.splice(0, history.value.length - 100)
    }
  }

  const levelHistory = computed(() => history.value.map(h => ({ label: new Date(h.time).toLocaleTimeString(), value: h.level })))
  const moneyHistory = computed(() => history.value.map(h => ({ label: new Date(h.time).toLocaleTimeString(), value: h.money })))

  function generateWeeklyReport() {
    const player = usePlayerStore()
    const dayIndex = new Date().getDay()
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const day = weekDays[dayIndex]
    const mix = (player.totalBugsFixed * 7 + player.totalOvertime * 13 + player.promotions * 3) % 5
    return {
      title: `第 ${Math.floor(player.totalEvents / 5 + 1)} 周工作周报`,
      employee: player.name,
      position: player.position,
      level: player.level,
      bugsFixed: player.totalBugsFixed,
      moneyEarned: player.totalMoneyEarned,
      overtime: player.totalOvertime,
      skillsLearned: player.skillsLearned,
      promotions: player.promotions,
      events: player.totalEvents,
      verdict: [
        '表现优异，建议加薪（但老板不会同意的）',
        '中规中矩，建议继续摸鱼',
        '代码质量有待提升，建议多用 AI',
        '加班太多，建议提高效率',
        '本月 Bug 产出比代码还多，建议转行测试',
      ][mix],
      day,
    }
  }

  const SAVE_KEY = 'bug-exe-analytics'

  function save() {
    return saveWithVersion(SAVE_KEY, { history: history.value, lastSnapshot: lastSnapshot.value })
  }

  function load() {
    const data = loadWithVersion(SAVE_KEY)
    if (!data) return
    history.value = data.history ?? []
    lastSnapshot.value = data.lastSnapshot ?? 0
  }

  function reset() {
    history.value = []
    lastSnapshot.value = 0
    removeStorage(SAVE_KEY)
  }

  return { history, levelHistory, moneyHistory, snapshot, generateWeeklyReport, save, load, reset }
})
