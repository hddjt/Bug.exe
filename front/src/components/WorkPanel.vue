<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLogStore } from '@/stores/log'
import { useAchievementStore } from '@/stores/achievement'
import { useToastStore } from '@/stores/toast'

const player = usePlayerStore()
const log = useLogStore()
const achievement = useAchievementStore()
const toast = useToastStore()

const modes = [
  { key: 'work', label: '💼 工作', desc: '经验↑ 工资↑ 快乐↓' },
  { key: 'slack', label: '🐟 摸鱼', desc: '快乐↑ 经验↓' },
  { key: 'study', label: '📚 学习', desc: '成长↑↑ 工资↓' },
  { key: 'overtime', label: '🌙 加班', desc: '经验↑↑ 工资↑↑ 精神↓↓ 快乐↓↓' },
  { key: 'meeting', label: '📋 开会', desc: '同事↑ 老板↑ 经验↓ 精神↓' },
  { key: 'paid-slack', label: '🚽 带薪拉屎', desc: '快乐↑↑ 老板关系↓' },
]

const modeCharacter = {
  work: { emoji: '🧑‍💻', action: '正在写代码...' },
  slack: { emoji: '😴', action: '偷偷摸鱼中...' },
  study: { emoji: '📖', action: '在学习新技术...' },
  overtime: { emoji: '😵‍💫', action: '疯狂加班中...' },
  meeting: { emoji: '🗣️', action: '在开会摸鱼...' },
  'paid-slack': { emoji: '🚽', action: '带薪拉屎中...' },
}

const dialogues = {
  work: ['这个需求什么时候改的？', '先跑一下测试', '代码能跑就别动', '又报错了...', '谁写的这坨代码'],
  slack: ['还有 3 分钟下班', '老板好像不在', '今天不想干活', '等会再做吧', '先刷会手机'],
  study: ['原来是这样', '学到了学到了', '文档写得太烂了', '还有这种操作？', '让我试试'],
  overtime: ['我想回家...', '天都黑了', '这周加了三天班了', '外卖又吃腻了', '我要猝死了'],
  meeting: ['讲完了没...', '这跟我有啥关系', '假装在记笔记', '别cue我', '好无聊'],
  'paid-slack': ['没人发现吧...', '再待一会儿', '舒服了', '不能被抓住', '摸鱼时间到'],
}

const sessionMoney = ref(0)
const sessionBugs = ref(0)
const floaters = ref([])
const currentDialogue = ref('')
let floaterId = 0
let dialogueTimer = null

const comboMultiplier = computed(() => {
  const c = player.combo
  if (c >= 20) return 3
  if (c >= 10) return 2
  if (c >= 5) return 1.5
  return 1
})

const statusEmoji = computed(() => {
  if (player.san <= 20) return '🤯'
  if (player.happiness <= 20) return '😭'
  if (player.san > 80 && player.happiness > 60) return '😎'
  if (player.san > 50 && player.happiness > 40) return '😐'
  if (player.san > 20) return '😰'
  return '😵'
})

const currentChar = computed(() => modeCharacter[player.mode] ?? modeCharacter.work)

const statusGlow = computed(() => {
  const s = player.san
  if (s > 70) return 'shadow-emerald-500/30 bg-emerald-500/10'
  if (s > 40) return 'shadow-amber-500/30 bg-amber-500/10'
  return 'shadow-red-500/30 bg-red-500/10'
})

function updateDialogue() {
  const pool = dialogues[player.mode] ?? dialogues.work
  let next
  do {
    next = pool[Math.floor(Math.random() * pool.length)]
  } while (next === currentDialogue.value)
  currentDialogue.value = next
}

function addFloater(text, color = 'text-amber-400') {
  const id = ++floaterId
  const x = 20 + Math.random() * 60
  floaters.value.push({ id, text, color, x })
  setTimeout(() => {
    floaters.value = floaters.value.filter(f => f.id !== id)
  }, 1500)
}

function checkAchievements() {
  const newOnes = achievement.check(player)
  newOnes.forEach(a => {
    toast.achievement(`解锁成就：${a.name}`)
    log.addLog(`🏆 解锁成就：${a.name} - ${a.desc}`, 'success')
  })
  achievement.save()
}

function switchMode(mode) {
  player.changeMode(mode)
  updateDialogue()
  log.addLog(`切换至${modes.find(m => m.key === mode).label}`, 'info')
}

function advanceSprint(amount) {
  player.sprintProgress += amount
  if (player.sprintProgress >= 100) {
    player.sprintProgress = 0
    const bonusExp = 50 + player.level * 5
    const bonusMoney = player.salary * 2
    player.addExp(bonusExp)
    player.addMoney(bonusMoney)
    log.addLog(`🎉 项目交付完成！经验+${Math.floor(bonusExp)}，奖金 ¥${bonusMoney.toLocaleString()}`, 'success')
    toast.success('项目交付成功！')
  }
}

function doWork() {
  const mult = comboMultiplier.value
  const expGain = (5 + player.coding / 2) * mult
  const moneyGain = Math.floor((player.salary / 5000 + 1) * mult)
  player.addExp(expGain)
  player.addMoney(moneyGain)
  sessionMoney.value += moneyGain
  player.san = Math.max(0, player.san - 1)
  player.combo++
  advanceSprint(1 + Math.floor(player.coding / 10))
  addFloater(`+${Math.floor(expGain)} EXP`, 'text-blue-400')
  addFloater(`+¥${moneyGain}`, 'text-amber-400')
  if (mult > 1) addFloater(`🔥 x${mult}`, 'text-red-400')
  log.addLog(`完成一次工作任务，经验+${Math.floor(expGain)}`, 'work')
  window.__dailyTasks?.trackAction('work')
  window.__dailyTasks?.trackEarn(moneyGain)
  window.__challengeTrack?.('work')
  window.__challengeTrack?.('money', moneyGain)
  window.__challengeTrack?.('combo', player.combo)
  checkAchievements()
}

function fixBug() {
  const mult = comboMultiplier.value
  const success = (player.tech * player.luck / 100) + Math.random() * 0.5
  if (success > 0.5) {
    const expGain = 15 * mult
    const moneyGain = 200 * mult
    player.addExp(expGain)
    player.debug += 0.5
    player.addMoney(moneyGain)
    sessionMoney.value += moneyGain
    player.totalBugsFixed++
    sessionBugs.value++
    player.combo++
    advanceSprint(2)
    window.__challengeTrack?.('bug')
    window.__challengeTrack?.('money', moneyGain)
    window.__challengeTrack?.('combo', player.combo)
    addFloater(`+${Math.floor(expGain)} EXP`, 'text-blue-400')
    addFloater(`+¥${moneyGain}`, 'text-amber-400')
    if (mult > 1) addFloater(`🔥 x${mult}`, 'text-red-400')
    log.addLog(`修复了一个 Bug！经验+${Math.floor(expGain)}`, 'success')
  } else {
    player.san -= 5
    player.combo = 0
    addFloater('修复失败!', 'text-red-400')
    log.addLog('修 Bug 失败...精神-5', 'error')
  }
  checkAchievements()
}

onMounted(() => {
  updateDialogue()
  dialogueTimer = setInterval(updateDialogue, 8000)
  window.__workPanel = { doWork, fixBug }
})

onUnmounted(() => {
  if (dialogueTimer) clearInterval(dialogueTimer)
  delete window.__workPanel
})
</script>

<template>
  <div class="h-full flex flex-col overflow-y-auto relative">
    <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
      <div class="code-scroll text-xs text-emerald-400 font-mono leading-relaxed whitespace-nowrap">
        <div v-for="n in 15" :key="n" class="code-line" :style="{ animationDelay: (n * 1.5) + 's' }">
          {{ 'const ' + ['foo', 'bar', 'data', 'result', 'status', 'config', 'query', 'value', 'index', 'total'][n % 10] + ' = ' + ['require', 'fetch', 'await', 'import', 'useState', 'defineComponent', 'createApp', 'computed', 'ref', 'reactive'][n % 10] + '(' + ["'bug.exe'", "'/api/data'", "42", "true", "null", "'pending'", "'success'", "'error'", "[]", "{}"][n % 10] + ')' }}
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col items-center py-4 px-6 relative z-10 space-y-3">
      <div class="bg-slate-800/80 border border-slate-700 rounded-lg px-5 py-2 max-w-md text-center relative">
        <div class="text-xs text-emerald-400/80 italic">💬 {{ currentDialogue }}</div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 border-r border-b border-slate-700 rotate-45"></div>
      </div>

      <div class="flex items-start gap-4 w-full max-w-lg">
        <div class="flex flex-col items-center shrink-0">
          <div class="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg transition-colors duration-500" :class="statusGlow">
            {{ currentChar.emoji }}
          </div>
          <div class="text-xs text-slate-400 mt-1">{{ currentChar.action }}</div>
        </div>

        <div class="flex gap-2 flex-1 pt-2">
          <div class="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
            <div class="text-[10px] text-slate-500">💰 收入</div>
            <div class="text-sm font-bold text-amber-400">+¥{{ sessionMoney.toLocaleString() }}</div>
          </div>
          <div class="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
            <div class="text-[10px] text-slate-500">🐛 修 Bug</div>
            <div class="text-sm font-bold text-red-400">{{ sessionBugs }} 次</div>
          </div>
          <div class="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-center">
            <div class="text-[10px] text-slate-500">⚡ 效率</div>
            <div class="text-sm font-bold text-emerald-400">x{{ comboMultiplier }}</div>
          </div>
        </div>
      </div>

      <div class="relative w-full max-w-md">
        <div class="bg-slate-900 border border-slate-700 rounded-t-lg p-3 pt-4 relative">
          <div class="absolute top-1 left-3 flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <div class="mt-1 font-mono text-[10px] leading-relaxed text-slate-500">
            <div class="text-blue-400">function <span class="text-amber-400">work</span>() {{ '{' }}</div>
            <div class="pl-4 text-slate-600">// {{ ['正在处理需求...', 'review 代码中...', '写单元测试...', '调试接口...', '查日志中...'][Math.floor(Math.random() * 5)] }}</div>
            <div class="pl-4 text-slate-500">return <span class="text-emerald-400">'done'</span>;</div>
            <div class="text-blue-400">{{ '}' }}</div>
          </div>
        </div>
        <div class="bg-slate-800 border-x border-b border-slate-700 rounded-b-lg px-4 py-1.5 flex items-center gap-3 text-xs text-slate-500">
          <span>⌨️ [===键盘===]</span>
          <span class="ml-auto">☕ 咖啡</span>
        </div>
      </div>

      <div v-if="player.combo > 0" class="flex items-center gap-2 w-full max-w-md">
        <span class="text-sm shrink-0" :class="{
          'text-red-400': player.combo >= 20,
          'text-amber-400': player.combo >= 10 && player.combo < 20,
          'text-emerald-400': player.combo >= 5 && player.combo < 10,
          'text-slate-300': player.combo < 5,
        }">
          🔥 x{{ comboMultiplier }}
        </span>
        <div class="flex-1 bg-slate-700 h-1.5 rounded overflow-hidden">
          <div class="h-full rounded transition-all duration-300" :class="{
            'bg-red-500': player.combo >= 20,
            'bg-amber-500': player.combo >= 10 && player.combo < 20,
            'bg-emerald-500': player.combo >= 5 && player.combo < 10,
            'bg-blue-500': player.combo < 5,
          }" :style="{ width: Math.min(player.combo / 30 * 100, 100) + '%' }"></div>
        </div>
        <span class="text-[10px] text-slate-500 w-14 text-right">{{ player.combo }} combo</span>
      </div>

      <div class="w-full max-w-md bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
        <div class="flex justify-between text-[10px] text-slate-400 mb-0.5">
          <span>📊 Sprint</span>
          <span>{{ Math.floor(player.sprintProgress) }}/100</span>
        </div>
        <div class="h-1.5 bg-slate-700 rounded overflow-hidden">
          <div class="h-full bg-emerald-500 rounded transition-all duration-300" :style="{ width: player.sprintProgress + '%' }"></div>
        </div>
      </div>

      <div class="flex flex-wrap gap-1.5 justify-center max-w-md">
        <button
          v-for="m in modes"
          :key="m.key"
          @click="switchMode(m.key)"
          class="px-2.5 py-1 rounded text-[11px] cursor-pointer transition"
          :class="player.mode === m.key ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="flex gap-3">
        <button
          @click="doWork"
          class="px-7 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-base cursor-pointer transition active:scale-95 shadow-lg shadow-blue-900/30"
        >
          完成需求
        </button>
        <button
          @click="fixBug"
          class="px-7 py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl font-bold text-base cursor-pointer transition active:scale-95 shadow-lg shadow-red-900/30"
        >
          修 Bug
        </button>
      </div>

      <div v-if="player.combo >= 20" class="text-[10px] text-red-400 font-bold animate-pulse">
        🔥🔥🔥 MAX COMBO! 🔥🔥🔥
      </div>

      <div class="flex items-center gap-2 text-[10px] text-slate-500">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        挂机中：每秒自动获得 {{ { work: '工作', slack: '摸鱼', study: '学习', overtime: '加班', meeting: '开会', 'paid-slack': '带薪拉屎' }[player.mode] ?? '工作' }} 收益
      </div>

      <div class="relative w-full max-w-md">
        <div v-for="f in floaters" :key="f.id" class="floater absolute pointer-events-none text-base font-bold z-20" :class="f.color" :style="{ left: f.x + '%', animation: 'float-up 1.5s ease-out forwards' }">
          {{ f.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float-up {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-50px) scale(1.2); }
}
@keyframes code-scroll {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.code-line {
  animation: code-scroll 25s linear infinite;
  opacity: 0.4;
}
.code-line:nth-child(even) {
  animation-duration: 35s;
  opacity: 0.2;
}
</style>
