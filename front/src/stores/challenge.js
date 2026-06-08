import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePlayerStore } from './player'
import { saveWithVersion, loadWithVersion, removeStorage } from './helpers'

const CHALLENGES = [
  { id: 'no-slack', name: '今日不摸鱼', desc: '不使用摸鱼和带薪拉屎模式累计 30 分钟', check: s => s.workTicks >= 1800, reward: 3 },
  { id: 'bug-blitz', name: 'Bug 歼灭战', desc: '修复 20 个 Bug', check: s => s.bugsFixed >= 20, reward: 2 },
  { id: 'workaholic', name: '工作狂', desc: '完成 50 次工作任务', check: s => s.workDone >= 50, reward: 3 },
  { id: 'money-maker', name: '日入斗金', desc: '单日赚取 ¥50000', check: s => s.moneyEarned >= 50000, reward: 2 },
  { id: 'combo-master', name: '连击大师', desc: '达到 30 连击', check: s => s.maxCombo >= 30, reward: 2 },
  { id: 'social-butterfly', name: '社交达人', desc: '与所有同事各聊天一次', check: s => s.chatAll, reward: 1 },
]

const TRACK_DISPATCH = {
  work(s) { s.workDone++ },
  bug(s) { s.bugsFixed++ },
  tick(s) {
    if (usePlayerStore().mode === 'work') s.workTicks++
  },
  money(s, val) { s.moneyEarned += val },
  combo(s, val) { s.maxCombo = Math.max(s.maxCombo, val) },
  chat(s) { s.chatAll = true },
}

export const useChallengeStore = defineStore('challenge', () => {
  const today = ref(new Date().toDateString())
  const completed = ref([])
  const stats = ref({ workTicks: 0, bugsFixed: 0, workDone: 0, moneyEarned: 0, maxCombo: 0, chatAll: false })
  const claimed = ref([])
  const newlyCompleted = ref([])

  const activeChallenges = computed(() => CHALLENGES.filter(c => !completed.value.includes(c.id)))

  const progress = computed(() => {
    const total = CHALLENGES.length
    const done = completed.value.length
    return { total, done, pct: total > 0 ? Math.round(done / total * 100) : 0 }
  })

  function resetIfNewDay() {
    const now = new Date().toDateString()
    if (today.value !== now) {
      today.value = now
      completed.value = []
      stats.value = { workTicks: 0, bugsFixed: 0, workDone: 0, moneyEarned: 0, maxCombo: 0, chatAll: false }
      claimed.value = []
      newlyCompleted.value = []
    }
  }

  function track(type, value) {
    resetIfNewDay()
    const handler = TRACK_DISPATCH[type]
    if (handler) handler(stats.value, value)
    _check()
  }

  function _check() {
    newlyCompleted.value = []
    for (const c of CHALLENGES) {
      if (completed.value.includes(c.id)) continue
      if (c.check(stats.value)) {
        completed.value.push(c.id)
        newlyCompleted.value.push(c)
      }
    }
  }

  function canClaim(challengeId) {
    return completed.value.includes(challengeId) && !claimed.value.includes(challengeId)
  }

  function claim(challengeId) {
    const c = CHALLENGES.find(x => x.id === challengeId)
    if (!c || !canClaim(challengeId)) return 0
    const player = usePlayerStore()
    player.earnSkillPoints(c.reward)
    claimed.value.push(challengeId)
    return c.reward
  }

  const SAVE_KEY = 'bug-exe-challenges'

  function save() {
    return saveWithVersion(SAVE_KEY, {
      today: today.value, completed: completed.value,
      stats: stats.value, claimed: claimed.value,
    })
  }

  function load() {
    const data = loadWithVersion(SAVE_KEY)
    if (!data) return
    today.value = data.today ?? new Date().toDateString()
    completed.value = data.completed ?? []
    stats.value = data.stats ?? { workTicks: 0, bugsFixed: 0, workDone: 0, moneyEarned: 0, maxCombo: 0, chatAll: false }
    claimed.value = data.claimed ?? []
    resetIfNewDay()
  }

  function reset() {
    today.value = new Date().toDateString()
    completed.value = []
    stats.value = { workTicks: 0, bugsFixed: 0, workDone: 0, moneyEarned: 0, maxCombo: 0, chatAll: false }
    claimed.value = []
    newlyCompleted.value = []
    removeStorage(SAVE_KEY)
  }

  return {
    today, completed, stats, claimed, newlyCompleted,
    activeChallenges, progress,
    resetIfNewDay, track, canClaim, claim,
    save, load, reset,
  }
})
