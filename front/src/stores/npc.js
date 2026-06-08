import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePlayerStore } from './player'
import { saveWithVersion, loadWithVersion, removeStorage } from './helpers'

const NPC_DATA = [
  { id: 'pm', name: '张产品', role: '产品经理', emoji: '👨‍💼', dialogues: ['这个需求改一下', '用户想要这个功能', '很简单的，半天能搞定吧', '我不管你怎么实现', '竞品都有这个功能'] },
  { id: 'tester', name: '李测试', role: '测试工程师', emoji: '👩‍🔬', dialogues: ['我发现了几个 Bug', '在我这复现了', '你确定你测了吗', '环境问题吧', '这个用例没过'] },
  { id: 'backend', name: '王后端', role: '后端开发', emoji: '👨‍💻', dialogues: ['接口写好了你试下', '这个我改不了', '你先清一下缓存', '肯定是前端的问题', '我本地跑得好好的'] },
  { id: 'designer', name: '赵设计', role: '设计师', emoji: '👩‍🎨', dialogues: ['这个间距不对', '配色要改一下', '我出了三版方案', '用这个字体', '参考了这个大厂的设计'] },
]

const CHAT_COOLDOWN_MS = 5000

export const useNpcStore = defineStore('npc', () => {
  const npcs = ref(NPC_DATA.map(n => ({ ...n, relation: 50, dialogue: n.dialogues[0] })))
  const lastChatTime = ref(0)

  const chatCooldown = computed(() => Date.now() - lastChatTime.value < CHAT_COOLDOWN_MS)

  const avgRelation = computed(() => {
    const arr = npcs.value
    return arr.length > 0 ? Math.floor(arr.reduce((s, n) => s + n.relation, 0) / arr.length) : 0
  })

  function getNpc(id) {
    return npcs.value.find(n => n.id === id)
  }

  function chat(id) {
    if (chatCooldown.value) return ''
    const npc = npcs.value.find(n => n.id === id)
    if (!npc) return ''
    const player = usePlayerStore()
    const idx = Math.floor(Math.random() * npc.dialogues.length)
    npc.dialogue = npc.dialogues[idx]
    npc.relation = Math.min(100, npc.relation + 1)
    player.colleagueRelation = Math.min(100, player.colleagueRelation + 1)
    lastChatTime.value = Date.now()
    return npc.dialogue
  }

  function adjustRelation(id, delta) {
    const npc = npcs.value.find(n => n.id === id)
    if (npc) npc.relation = Math.max(0, Math.min(100, npc.relation + delta))
  }

  const SAVE_KEY = 'bug-exe-npcs'

  function save() {
    return saveWithVersion(SAVE_KEY, {
      npcs: npcs.value.map(n => ({ id: n.id, relation: n.relation })),
      lastChatTime: lastChatTime.value,
    })
  }

  function load() {
    const data = loadWithVersion(SAVE_KEY)
    if (!data) return
    if (data.npcs) {
      for (const saved of data.npcs) {
        const npc = npcs.value.find(n => n.id === saved.id)
        if (npc) npc.relation = saved.relation
      }
    }
    lastChatTime.value = data.lastChatTime ?? 0
  }

  function reset() {
    npcs.value.forEach(n => (n.relation = 50))
    lastChatTime.value = 0
    removeStorage(SAVE_KEY)
  }

  return { npcs, avgRelation, chatCooldown, getNpc, chat, adjustRelation, save, load, reset }
})
