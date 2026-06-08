import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const POSITIONS = [
  { name: '实习生', level: 1, salary: 3000 },
  { name: '初级开发', level: 5, salary: 6000 },
  { name: '中级开发', level: 15, salary: 10000 },
  { name: '高级开发', level: 30, salary: 15000 },
  { name: '技术主管', level: 45, salary: 22000 },
  { name: '架构师', level: 60, salary: 30000 },
  { name: 'CTO', level: 80, salary: 50000 },
  { name: '自由开发者', level: 100, salary: 80000 },
]

export const usePlayerStore = defineStore('player', () => {
  const name = ref('打工人')
  const level = ref(1)
  const exp = ref(0)
  const money = ref(0)

  const energy = ref(100)
  const maxEnergy = ref(100)
  const san = ref(100)
  const maxSan = ref(100)
  const happiness = ref(50)

  const tech = ref(1)
  const coding = ref(1)
  const debug = ref(1)
  const architecture = ref(1)
  const learning = ref(1)

  const colleagueRelation = ref(50)
  const bossRelation = ref(50)
  const productRelation = ref(50)
  const luck = ref(10)

  const positionIndex = ref(0)
  const mode = ref('work')
  const skillPoints = ref(0)

  const totalBugsFixed = ref(0)
  const totalMoneyEarned = ref(0)
  const totalEvents = ref(0)
  const totalSlackHappiness = ref(0)
  const totalStudyTech = ref(0)
  const totalOvertime = ref(0)
  const promotions = ref(0)
  const skillsLearned = ref(0)

  const position = computed(() => POSITIONS[positionIndex.value]?.name ?? '实习生')
  const salary = computed(() => POSITIONS[positionIndex.value]?.salary ?? 3000)
  const expToNext = computed(() => level.value * 100 + 50)

  function addExp(amount) {
    exp.value += amount
    while (exp.value >= expToNext.value && exp.value > 0) {
      exp.value -= expToNext.value
      level.value++
      skillPoints.value += 1
      checkPositionUpgrade()
    }
  }

  function addMoney(amount) {
    money.value += amount
    if (amount > 0) totalMoneyEarned.value += amount
  }

  function checkPositionUpgrade() {
    const next = positionIndex.value + 1
    if (next < POSITIONS.length && level.value >= POSITIONS[next].level) {
      positionIndex.value = next
      promotions.value++
    }
  }

  function changeMode(newMode) {
    mode.value = newMode
  }

  function tick() {
    if (mode.value === 'work') {
      const gain = 1 + coding.value / 5
      addExp(gain)
      const earned = Math.floor(salary.value / 10000) + 1
      addMoney(earned)
      happiness.value = Math.max(0, happiness.value - 0.2)
      energy.value = Math.max(0, energy.value - 0.1)
    } else if (mode.value === 'slack') {
      happiness.value = Math.min(100, happiness.value + 0.5)
      totalSlackHappiness.value += 0.5
      addExp(0.2)
    } else if (mode.value === 'study') {
      learning.value += 0.02
      tech.value += 0.01
      coding.value += 0.01
      totalStudyTech.value += 0.03
      san.value = Math.min(100, san.value + 0.1)
    }

    const curHappiness = happiness.value
    if (curHappiness < 20) {
      san.value = Math.max(0, san.value - 0.1)
    }
  }

  function useItem(effects) {
    if (effects.energy) energy.value = Math.min(maxEnergy.value, energy.value + effects.energy)
    if (effects.san) san.value = Math.min(maxSan.value, san.value + effects.san)
    if (effects.happiness) happiness.value = Math.min(100, happiness.value + effects.happiness)
    if (effects.exp) addExp(effects.exp)
    if (effects.tech) tech.value += effects.tech
    if (effects.coding) coding.value += effects.coding
    if (effects.debug) debug.value += effects.debug
    if (effects.architecture) architecture.value += effects.architecture
    if (effects.learning) learning.value += effects.learning
    if (effects.money) money.value += effects.money
  }

  function applyEventEffects(effects) {
    useItem(effects)
    if (effects.colleagueRelation) colleagueRelation.value = Math.max(0, Math.min(100, colleagueRelation.value + effects.colleagueRelation))
    if (effects.bossRelation) bossRelation.value = Math.max(0, Math.min(100, bossRelation.value + effects.bossRelation))
    if (effects.productRelation) productRelation.value = Math.max(0, Math.min(100, productRelation.value + effects.productRelation))
    if (effects.luck) luck.value = Math.max(0, Math.min(100, luck.value + effects.luck))
    if (effects.san) san.value = Math.max(0, Math.min(maxSan.value, san.value + effects.san))
  }

  const SAVE_KEY = 'bug-exe-player'

  function save() {
    const data = {
      name: name.value, level: level.value, exp: exp.value, money: money.value,
      energy: energy.value, maxEnergy: maxEnergy.value, san: san.value, maxSan: maxSan.value,
      happiness: happiness.value,
      tech: tech.value, coding: coding.value, debug: debug.value,
      architecture: architecture.value, learning: learning.value,
      colleagueRelation: colleagueRelation.value, bossRelation: bossRelation.value,
      productRelation: productRelation.value, luck: luck.value,
      positionIndex: positionIndex.value, mode: mode.value, skillPoints: skillPoints.value,
      totalBugsFixed: totalBugsFixed.value, totalMoneyEarned: totalMoneyEarned.value,
      totalEvents: totalEvents.value, totalSlackHappiness: totalSlackHappiness.value,
      totalStudyTech: totalStudyTech.value, totalOvertime: totalOvertime.value,
      promotions: promotions.value, skillsLearned: skillsLearned.value,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    try {
      const data = JSON.parse(raw)
      name.value = data.name ?? '打工人'
      level.value = data.level ?? 1
      exp.value = data.exp ?? 0
      money.value = data.money ?? 0
      energy.value = data.energy ?? 100
      maxEnergy.value = data.maxEnergy ?? 100
      san.value = data.san ?? 100
      maxSan.value = data.maxSan ?? 100
      happiness.value = data.happiness ?? 50
      tech.value = data.tech ?? 1
      coding.value = data.coding ?? 1
      debug.value = data.debug ?? 1
      architecture.value = data.architecture ?? 1
      learning.value = data.learning ?? 1
      colleagueRelation.value = data.colleagueRelation ?? 50
      bossRelation.value = data.bossRelation ?? 50
      productRelation.value = data.productRelation ?? 50
      luck.value = data.luck ?? 10
      positionIndex.value = data.positionIndex ?? 0
      mode.value = data.mode ?? 'work'
      skillPoints.value = data.skillPoints ?? 0
      totalBugsFixed.value = data.totalBugsFixed ?? 0
      totalMoneyEarned.value = data.totalMoneyEarned ?? 0
      totalEvents.value = data.totalEvents ?? 0
      totalSlackHappiness.value = data.totalSlackHappiness ?? 0
      totalStudyTech.value = data.totalStudyTech ?? 0
      totalOvertime.value = data.totalOvertime ?? 0
      promotions.value = data.promotions ?? 0
      skillsLearned.value = data.skillsLearned ?? 0
      return true
    } catch {
      return false
    }
  }

  function reset() {
    name.value = '打工人'
    level.value = 1
    exp.value = 0
    money.value = 0
    energy.value = 100
    maxEnergy.value = 100
    san.value = 100
    maxSan.value = 100
    happiness.value = 50
    tech.value = 1
    coding.value = 1
    debug.value = 1
    architecture.value = 1
    learning.value = 1
    colleagueRelation.value = 50
    bossRelation.value = 50
    productRelation.value = 50
    luck.value = 10
    positionIndex.value = 0
    mode.value = 'work'
    skillPoints.value = 0
    totalBugsFixed.value = 0
    totalMoneyEarned.value = 0
    totalEvents.value = 0
    totalSlackHappiness.value = 0
    totalStudyTech.value = 0
    totalOvertime.value = 0
    promotions.value = 0
    skillsLearned.value = 0
    localStorage.removeItem(SAVE_KEY)
  }

  return {
    name, level, exp, money,
    energy, maxEnergy, san, maxSan, happiness,
    tech, coding, debug, architecture, learning,
    colleagueRelation, bossRelation, productRelation, luck,
    positionIndex, mode, skillPoints,
    totalBugsFixed, totalMoneyEarned, totalEvents,
    totalSlackHappiness, totalStudyTech, totalOvertime,
    promotions, skillsLearned,
    position, salary, expToNext,
    addExp, addMoney, changeMode, tick, useItem, applyEventEffects,
    save, load, reset,
  }
})
