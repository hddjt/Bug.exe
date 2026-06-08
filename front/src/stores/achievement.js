import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const ACHIEVEMENTS = [
  { id: 'first-bug', name: '第一次修 Bug', desc: '成功修复第一个 Bug', condition: s => s.totalBugsFixed >= 1 },
  { id: 'bug-hunter', name: 'Bug 猎人', desc: '累计修复 100 个 Bug', condition: s => s.totalBugsFixed >= 100 },
  { id: 'bug-master', name: 'Bug 终结者', desc: '累计修复 500 个 Bug', condition: s => s.totalBugsFixed >= 500 },
  { id: 'first-money', name: '第一桶金', desc: '累计赚到 10 万', condition: s => s.totalMoneyEarned >= 100000 },
  { id: 'millionaire', name: '百万富翁', desc: '累计赚到 100 万', condition: s => s.totalMoneyEarned >= 1000000 },
  { id: 'level-10', name: '初级打工人', desc: '达到 10 级', condition: s => s.level >= 10 },
  { id: 'level-30', name: '资深打工人', desc: '达到 30 级', condition: s => s.level >= 30 },
  { id: 'level-60', name: '职场精英', desc: '达到 60 级', condition: s => s.level >= 60 },
  { id: 'level-100', name: '职场传说', desc: '达到 100 级', condition: s => s.level >= 100 },
  { id: 'first-event', name: '初次见世面', desc: '经历第一个随机事件', condition: s => s.totalEvents >= 1 },
  { id: 'event-collector', name: '事件达人', desc: '经历 50 个随机事件', condition: s => s.totalEvents >= 50 },
  { id: 'promotion', name: '升职了', desc: '获得第一次晋升', condition: s => s.promotions >= 1 },
  { id: 'director', name: '管理层', desc: '晋升到技术主管', condition: s => s.positionIndex >= 4 },
  { id: 'cto', name: '首席技术官', desc: '晋升到 CTO', condition: s => s.positionIndex >= 6 },
  { id: 'freelancer', name: '自由之魂', desc: '成为自由开发者', condition: s => s.positionIndex >= 7 },
  { id: 'slacker', name: '摸鱼大师', desc: '累计摸鱼增加 1000 快乐', condition: s => s.totalSlackHappiness >= 1000 },
  { id: 'learner', name: '学无止境', desc: '累计学习增加 100 技术力', condition: s => s.totalStudyTech >= 100 },
  { id: 'skill-collector', name: '技能收集者', desc: '学会 10 个技能', condition: s => s.skillsLearned >= 10 },
  { id: 'full-stack', name: '全栈工程师', desc: '学会 20 个技能', condition: s => s.skillsLearned >= 20 },
  { id: 'overtime-worker', name: '加班狂魔', desc: '累计加班 50 次', condition: s => s.totalOvertime >= 50 },
]

export const useAchievementStore = defineStore('achievement', () => {
  const unlocked = ref([])
  const newlyUnlocked = ref([])

  const total = computed(() => ACHIEVEMENTS.length)
  const progress = computed(() => unlocked.value.length)

  function check(playerStats) {
    const newOnes = []
    for (const a of ACHIEVEMENTS) {
      if (unlocked.value.includes(a.id)) continue
      if (a.condition(playerStats)) {
        unlocked.value.push(a.id)
        newOnes.push(a)
      }
    }
    newlyUnlocked.value = newOnes
    return newOnes
  }

  function getInfo(id) {
    return ACHIEVEMENTS.find(a => a.id === id)
  }

  function getUnlocked() {
    return ACHIEVEMENTS.filter(a => unlocked.value.includes(a.id))
  }

  function getLocked() {
    return ACHIEVEMENTS.filter(a => !unlocked.value.includes(a.id))
  }

  const SAVE_KEY = 'bug-exe-achievements'

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ unlocked: unlocked.value }))
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      unlocked.value = data.unlocked ?? []
    } catch { /* ignore */ }
  }

  function reset() {
    unlocked.value = []
    localStorage.removeItem(SAVE_KEY)
  }

  return {
    unlocked, newlyUnlocked, total, progress,
    check, getInfo, getUnlocked, getLocked,
    save, load, reset,
  }
})
