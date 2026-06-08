import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePlayerStore } from './player'
import { useLogStore } from '@/stores/log'

const BOSSES = [
  { id: 'deadline-demon', name: 'Deadline Demon', emoji: '👹', level: 10, hp: 100, atk: 8, def: 2, desc: '项目截止日期的化身，拥有无限变更需求的能力' },
  { id: 'requirement-beast', name: '需求变更兽', emoji: '🐉', level: 25, hp: 250, atk: 15, def: 5, desc: '产品经理的终极形态，擅长临场改需求' },
  { id: 'midnight-monster', name: '凌晨消息怪', emoji: '👻', level: 40, hp: 400, atk: 22, def: 10, desc: '专在凌晨发消息的怪物，让人精神崩溃' },
  { id: 'outage-dragon', name: '线上事故龙', emoji: '🐲', level: 60, hp: 600, atk: 35, def: 18, desc: '线上服务的守护者，一旦出现就是大新闻' },
  { id: 'refactor-giant', name: '重构巨人', emoji: '🗿', level: 80, hp: 900, atk: 45, def: 25, desc: '遗留代码的化身，动一处就塌一片' },
]

const ATTACK_TYPES = [
  { id: 'code', name: '写代码', desc: '用编码能力攻击', dmg: (p) => 5 + p.coding },
  { id: 'debug', name: '修 Bug', desc: '用 Debug 技巧攻击', dmg: (p) => 8 + p.debug * 1.5 },
  { id: 'architect', name: '架构重构', desc: '用架构能力重击', dmg: (p) => 10 + p.architecture * 2 },
  { id: 'learning', name: '现学现卖', desc: '临时学新招数', dmg: (p) => 3 + p.learning * 3, special: '闪避率+20%' },
  { id: 'defend', name: '防守', desc: '减少受到的伤害', dmg: 0, block: 0.5 },
]

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
    if (available.length === 0) return null
    return available[0]
  }

  function startBattle(boss) {
    const player = usePlayerStore()
    active.value = boss
    bossHp.value = boss.hp
    bossMaxHp.value = boss.hp
    playerHp.value = 50 + Math.floor(player.san * 0.5)
    playerMaxHp.value = playerHp.value
    turn.value = 0
    battleLog.value = [`⚔️ ${boss.name} 出现了！`]
    clearInterval(bossTimer.value)
    bossTimer.value = setInterval(() => bossAttack(), 3000)
  }

  function playerAction(actionId) {
    if (!active.value) return
    const player = usePlayerStore()
    const action = ATTACK_TYPES.find(a => a.id === actionId)
    if (!action) return

    turn.value++
    let dmg = 0
    if (typeof action.dmg === 'function') {
      dmg = action.dmg(player)
    } else {
      dmg = action.dmg
    }
    const variance = 0.8 + Math.random() * 0.4
    dmg = Math.max(1, Math.floor(dmg * variance))
    bossHp.value = Math.max(0, bossHp.value - dmg)
    battleLog.value.push(`💥 你使用了「${action.name}」，造成 ${dmg} 点伤害！`)

    if (bossHp.value <= 0) {
      victory()
      return
    }

    if (action.id !== 'defend') {
      bossAttack()
    }
  }

  function bossAttack() {
    if (!active.value) return
    const player = usePlayerStore()
    const variance = 0.7 + Math.random() * 0.6
    const dmg = Math.max(1, Math.floor(active.value.atk * variance - player.tech * 0.3))
    playerHp.value = Math.max(0, playerHp.value - dmg)
    battleLog.value.push(`👹 ${active.value.name} 攻击！受到 ${dmg} 点伤害`)

    if (playerHp.value <= 0) {
      defeat()
    }
  }

  function victory() {
    clearInterval(bossTimer.value)
    const player = usePlayerStore()
    const boss = active.value
    const expReward = 100 + boss.level * 10
    const moneyReward = 2000 + boss.level * 500
    player.addExp(expReward)
    player.addMoney(moneyReward)
    player.skillPoints += 2
    defeated.value.push(boss.id)
    battleLog.value.push(`🎉 击败了 ${boss.name}！经验+${Math.floor(expReward)}，奖金 ¥${moneyReward}，技能点+2！`)
    const log = useLogStore()
    log.addLog(`🎉 Boss 战胜利！击败了 ${boss.name}`, 'success')
    setTimeout(() => { active.value = null }, 3000)
  }

  function defeat() {
    clearInterval(bossTimer.value)
    const player = usePlayerStore()
    player.san = Math.max(0, player.san - 20)
    player.happiness = Math.max(0, player.happiness - 10)
    battleLog.value.push(`💀 你被 ${active.value.name} 击败了...精神-20`)
    const log = useLogStore()
    log.addLog(`💀 Boss 战失败...被 ${active.value.name} 击败`, 'error')
    setTimeout(() => { active.value = null }, 3000)
  }

  function flee() {
    clearInterval(bossTimer.value)
    const player = usePlayerStore()
    player.san = Math.max(0, player.san - 5)
    battleLog.value.push(`🏃 你逃跑了...精神-5`)
    const log = useLogStore()
    log.addLog(`🏃 从 Boss 战中逃跑`, 'info')
    setTimeout(() => { active.value = null }, 1500)
  }

  function checkTrigger() {
    const player = usePlayerStore()
    const boss = getBossForLevel(player.level)
    if (boss && Math.random() < 0.002) {
      startBattle(boss)
      return true
    }
    return false
  }

  const SAVE_KEY = 'bug-exe-boss'

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ defeated: defeated.value }))
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      defeated.value = data.defeated ?? []
    } catch { /* ignore */ }
  }

  function reset() {
    defeated.value = []
    localStorage.removeItem(SAVE_KEY)
  }

  return {
    active, bossHp, bossMaxHp, playerHp, playerMaxHp, turn, battleLog, defeated,
    isFighting, ATTACK_TYPES, BOSSES,
    startBattle, playerAction, bossAttack, flee, checkTrigger,
    save, load, reset,
  }
})
