import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePlayerStore } from './player'
import { useLogStore } from '@/stores/log'
import { saveWithVersion, loadWithVersion, removeStorage } from './helpers'

const BOSSES = [
  { id: 'deadline-demon', name: 'Deadline Demon', emoji: '👹', level: 10, hp: 100, atk: 8, def: 2, desc: '项目截止日期的化身，拥有无限变更需求的能力' },
  { id: 'requirement-beast', name: '需求变更兽', emoji: '🐉', level: 25, hp: 250, atk: 15, def: 5, desc: '产品经理的终极形态，擅长临场改需求' },
  { id: 'midnight-monster', name: '凌晨消息怪', emoji: '👻', level: 40, hp: 400, atk: 22, def: 10, desc: '专在凌晨发消息的怪物，让人精神崩溃' },
  { id: 'outage-dragon', name: '线上事故龙', emoji: '🐲', level: 60, hp: 600, atk: 35, def: 18, desc: '线上服务的守护者，一旦出现就是大新闻' },
  { id: 'refactor-giant', name: '重构巨人', emoji: '🗿', level: 80, hp: 900, atk: 45, def: 25, desc: '遗留代码的化身，动一处就塌一片' },
]

const ATTACK_TYPES = [
  { id: 'code', name: '写代码', desc: '用编码能力攻击', dmg: p => 5 + p.coding },
  { id: 'debug', name: '修 Bug', desc: '用 Debug 技巧攻击', dmg: p => 8 + p.debug * 1.5 },
  { id: 'architect', name: '架构重构', desc: '用架构能力重击', dmg: p => 10 + p.architecture * 2 },
  { id: 'learning', name: '现学现卖', desc: '临时学新招数', dmg: p => 3 + p.learning * 3 },
  { id: 'defend', name: '防守', desc: '减少受到的伤害', dmg: 0 },
]

const TRIGGER_CHANCE = 0.002
const PLAYER_HP_BASE = 50
const PLAYER_HP_SAN_FACTOR = 0.5
const BOSS_ATTACK_INTERVAL = 3000
const DMG_VARIANCE_MIN = 0.8
const DMG_VARIANCE_RANGE = 0.4
const EXP_REWARD_BASE = 100
const EXP_REWARD_PER_LEVEL = 10
const MONEY_REWARD_BASE = 2000
const MONEY_REWARD_PER_LEVEL = 500
const SKILL_POINT_REWARD = 2
const DEFEAT_SAN_PENALTY = 20
const DEFEAT_HAPPINESS_PENALTY = 10
const FLEE_SAN_PENALTY = 5

export const useBossStore = defineStore('boss', () => {
  const active = ref(null)
  const bossHp = ref(0)
  const bossMaxHp = ref(0)
  const playerHp = ref(100)
  const playerMaxHp = ref(100)
  const turn = ref(0)
  const battleLog = ref([])
  const defeated = ref([])
  const bossTimer = ref(null)

  const isFighting = computed(() => active.value !== null)

  function getBossForLevel(level) {
    const available = BOSSES.filter(b => !defeated.value.includes(b.id) && level >= b.level)
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null
  }

  function _stopTimer() {
    if (bossTimer.value) {
      clearInterval(bossTimer.value)
      bossTimer.value = null
    }
  }

  function _startBossTimer() {
    _stopTimer()
    bossTimer.value = setInterval(() => {
      if (active.value && playerHp.value > 0 && bossHp.value > 0) {
        bossAttack()
      }
    }, BOSS_ATTACK_INTERVAL)
  }

  function startBattle(boss) {
    const player = usePlayerStore()
    active.value = boss
    bossHp.value = boss.hp
    bossMaxHp.value = boss.hp
    playerHp.value = PLAYER_HP_BASE + Math.floor(player.san * PLAYER_HP_SAN_FACTOR)
    playerMaxHp.value = playerHp.value
    turn.value = 0
    battleLog.value = [`⚔️ ${boss.name} 出现了！`]
    _startBossTimer()
  }

  function playerAction(actionId) {
    if (!active.value || playerHp.value <= 0 || bossHp.value <= 0) return
    const player = usePlayerStore()
    const action = ATTACK_TYPES.find(a => a.id === actionId)
    if (!action) return

    _stopTimer()
    turn.value++

    let dmg = 0
    if (typeof action.dmg === 'function') dmg = action.dmg(player)
    else dmg = action.dmg
    const variance = DMG_VARIANCE_MIN + Math.random() * DMG_VARIANCE_RANGE
    dmg = Math.max(1, Math.floor(dmg * variance))
    bossHp.value = Math.max(0, bossHp.value - dmg)
    battleLog.value.push(`💥 你使用了「${action.name}」，造成 ${dmg} 点伤害！`)

    if (bossHp.value <= 0) { victory(); return }

    if (action.id === 'defend') {
      battleLog.value.push('🛡️ 你进入防守姿态，伤害减半')
      _startBossTimer()
      return
    }
    bossAttack()
    if (active.value) _startBossTimer()
  }

  function bossAttack() {
    if (!active.value || playerHp.value <= 0) return
    const player = usePlayerStore()
    const variance = 0.7 + Math.random() * 0.6
    const dmg = Math.max(1, Math.floor(active.value.atk * variance - player.tech * 0.3))
    playerHp.value = Math.max(0, playerHp.value - dmg)
    battleLog.value.push(`👹 ${active.value.name} 攻击！受到 ${dmg} 点伤害`)
    if (playerHp.value <= 0) defeat()
  }

  function victory() {
    _stopTimer()
    const player = usePlayerStore()
    const boss = active.value
    const expReward = EXP_REWARD_BASE + boss.level * EXP_REWARD_PER_LEVEL
    const moneyReward = MONEY_REWARD_BASE + boss.level * MONEY_REWARD_PER_LEVEL
    player.addExp(expReward)
    player.addMoney(moneyReward)
    player.earnSkillPoints(SKILL_POINT_REWARD)
    defeated.value.push(boss.id)
    battleLog.value.push(`🎉 击败了 ${boss.name}！经验+${Math.floor(expReward)}，奖金 ¥${moneyReward}，技能点+${SKILL_POINT_REWARD}！`)
    useLogStore().addLog(`🎉 Boss 战胜利！击败了 ${boss.name}`, 'success')
    setTimeout(() => { active.value = null }, 3000)
  }

  function defeat() {
    _stopTimer()
    const player = usePlayerStore()
    player.san = Math.max(0, player.san - DEFEAT_SAN_PENALTY)
    player.happiness = Math.max(0, player.happiness - DEFEAT_HAPPINESS_PENALTY)
    battleLog.value.push(`💀 你被 ${active.value.name} 击败了...精神-${DEFEAT_SAN_PENALTY}`)
    useLogStore().addLog(`💀 Boss 战失败...被 ${active.value.name} 击败`, 'error')
    setTimeout(() => { active.value = null }, 3000)
  }

  function flee() {
    _stopTimer()
    usePlayerStore().san = Math.max(0, usePlayerStore().san - FLEE_SAN_PENALTY)
    battleLog.value.push(`🏃 你逃跑了...精神-${FLEE_SAN_PENALTY}`)
    useLogStore().addLog(`🏃 从 Boss 战中逃跑`, 'info')
    setTimeout(() => { active.value = null }, 1500)
  }

  function checkTrigger() {
    const player = usePlayerStore()
    const boss = getBossForLevel(player.level)
    if (boss && Math.random() < TRIGGER_CHANCE) {
      startBattle(boss)
      return true
    }
    return false
  }

  const SAVE_KEY = 'bug-exe-boss'

  function save() {
    return saveWithVersion(SAVE_KEY, { defeated: defeated.value })
  }

  function load() {
    const data = loadWithVersion(SAVE_KEY)
    if (!data) return
    defeated.value = data.defeated ?? []
  }

  function reset() {
    _stopTimer()
    active.value = null
    bossHp.value = 0; bossMaxHp.value = 0
    playerHp.value = 100; playerMaxHp.value = 100
    turn.value = 0
    battleLog.value = []
    defeated.value = []
    removeStorage(SAVE_KEY)
  }

  return {
    active, bossHp, bossMaxHp, playerHp, playerMaxHp, turn, battleLog, defeated,
    isFighting, ATTACK_TYPES, BOSSES,
    startBattle, playerAction, bossAttack, flee, checkTrigger,
    save, load, reset,
  }
})
