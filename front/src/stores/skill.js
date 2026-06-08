import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { usePlayerStore } from './player'
import { saveWithVersion, loadWithVersion, removeStorage } from './helpers'

const SKILL_TREE = [
  { id: 'html', name: 'HTML', category: 'frontend', level: 0, maxLevel: 3, effects: { tech: 1 }, prerequisites: [] },
  { id: 'css', name: 'CSS', category: 'frontend', level: 0, maxLevel: 3, effects: { tech: 1 }, prerequisites: [] },
  { id: 'javascript', name: 'JavaScript', category: 'frontend', level: 0, maxLevel: 5, effects: { coding: 2, tech: 1 }, prerequisites: ['html', 'css'] },
  { id: 'vue', name: 'Vue', category: 'frontend', level: 0, maxLevel: 5, effects: { coding: 2, tech: 2 }, prerequisites: ['javascript'] },
  { id: 'react', name: 'React', category: 'frontend', level: 0, maxLevel: 5, effects: { coding: 2, tech: 2 }, prerequisites: ['javascript'] },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', level: 0, maxLevel: 5, effects: { coding: 2, tech: 1 }, prerequisites: ['javascript'] },
  { id: 'tailwind', name: 'TailwindCSS', category: 'frontend', level: 0, maxLevel: 3, effects: { tech: 2 }, prerequisites: ['css'] },
  { id: 'testing', name: '单元测试', category: 'frontend', level: 0, maxLevel: 3, effects: { debug: 2 }, prerequisites: ['javascript'] },
  { id: 'perf-opt', name: '性能优化', category: 'frontend', level: 0, maxLevel: 3, effects: { architecture: 2, tech: 2 }, prerequisites: ['vue', 'react'] },
  { id: 'engineering', name: '工程化', category: 'frontend', level: 0, maxLevel: 3, effects: { architecture: 3 }, prerequisites: ['vue', 'react'] },
  { id: 'vite-tool', name: 'Vite/Webpack', category: 'frontend', level: 0, maxLevel: 3, effects: { architecture: 2 }, prerequisites: ['engineering'] },
  { id: 'node', name: 'Node.js', category: 'backend', level: 0, maxLevel: 5, effects: { coding: 2, tech: 1 }, prerequisites: ['javascript'] },
  { id: 'database', name: '数据库', category: 'backend', level: 0, maxLevel: 4, effects: { architecture: 2 }, prerequisites: ['node'] },
  { id: 'cache', name: '缓存', category: 'backend', level: 0, maxLevel: 3, effects: { architecture: 2, tech: 1 }, prerequisites: ['database'] },
  { id: 'deploy', name: '部署', category: 'backend', level: 0, maxLevel: 3, effects: { tech: 2 }, prerequisites: ['node'] },
  { id: 'api-design', name: '接口设计', category: 'backend', level: 0, maxLevel: 3, effects: { architecture: 2, coding: 1 }, prerequisites: ['database'] },
  { id: 'quick-switch', name: '快速切屏', category: 'slack', level: 0, maxLevel: 3, effects: { luck: 3 }, prerequisites: [] },
  { id: 'alt-tab', name: 'Alt+Tab大师', category: 'slack', level: 0, maxLevel: 3, effects: { luck: 4 }, prerequisites: ['quick-switch'] },
  { id: 'desk-watch', name: '工位观察', category: 'slack', level: 0, maxLevel: 2, effects: { luck: 3 }, prerequisites: [] },
  { id: 'boss-radar', name: '老板雷达', category: 'slack', level: 0, maxLevel: 3, effects: { luck: 5 }, prerequisites: ['desk-watch'] },
  { id: 'slack-mask', name: '摸鱼伪装', category: 'slack', level: 0, maxLevel: 5, effects: { luck: 3, happiness: 2 }, prerequisites: ['alt-tab', 'boss-radar'] },
  { id: 'chatgpt', name: 'ChatGPT', category: 'ai', level: 0, maxLevel: 5, effects: { coding: 3, tech: 1, learning: 2 }, prerequisites: [] },
  { id: 'cursor', name: 'Cursor', category: 'ai', level: 0, maxLevel: 5, effects: { coding: 4, debug: 2 }, prerequisites: ['chatgpt'] },
  { id: 'copilot', name: 'Copilot', category: 'ai', level: 0, maxLevel: 4, effects: { coding: 3, debug: 3 }, prerequisites: ['chatgpt'] },
  { id: 'deepseek', name: 'DeepSeek', category: 'ai', level: 0, maxLevel: 5, effects: { coding: 4, learning: 3 }, prerequisites: ['cursor', 'copilot'] },
  { id: 'claude', name: 'Claude', category: 'ai', level: 0, maxLevel: 4, effects: { coding: 3, architecture: 2 }, prerequisites: ['chatgpt'] },
  { id: 'cline', name: 'Cline/Bolt', category: 'ai', level: 0, maxLevel: 3, effects: { debug: 3, learning: 2 }, prerequisites: ['cursor', 'copilot'] },
  { id: 'ai-agent', name: 'AI Agent', category: 'ai', level: 0, maxLevel: 5, effects: { coding: 5, architecture: 3 }, prerequisites: ['deepseek', 'claude'] },
  { id: 'communication', name: '沟通艺术', category: 'management', level: 0, maxLevel: 3, effects: { colleagueRelation: 5, luck: 1 }, prerequisites: [] },
  { id: 'upward-mgmt', name: '向上管理', category: 'management', level: 0, maxLevel: 3, effects: { bossRelation: 5 }, prerequisites: ['communication'] },
  { id: 'pm-defense', name: 'PM防忽悠', category: 'management', level: 0, maxLevel: 3, effects: { productRelation: 5 }, prerequisites: ['communication'] },
  { id: 'emotion-mgmt', name: '情绪管理', category: 'management', level: 0, maxLevel: 5, effects: { san: 5, happiness: 2 }, prerequisites: [] },
]

export const useSkillStore = defineStore('skill', () => {
  const skills = ref(SKILL_TREE.map(s => ({ ...s })))
  const skillsMap = computed(() => new Map(skills.value.map(s => [s.id, s])))

  function getSkillsByCategory(category) {
    return skills.value.filter(s => s.category === category)
  }

  function _getSkill(id) {
    return skillsMap.value.get(id) ?? skills.value.find(s => s.id === id)
  }

  function canUpgrade(skillId) {
    const skill = _getSkill(skillId)
    if (!skill || skill.level >= skill.maxLevel) return false
    const player = usePlayerStore()
    if (player.skillPoints < 1) return false
    for (const prereq of skill.prerequisites) {
      const ps = _getSkill(prereq)
      if (!ps || ps.level < 1) return false
    }
    return true
  }

  function upgradeSkill(skillId) {
    const skill = _getSkill(skillId)
    if (!skill) return false
    if (skill.level >= skill.maxLevel) return false
    const player = usePlayerStore()
    if (!player.spendSkillPoints(1)) return false
    for (const prereq of skill.prerequisites) {
      const ps = _getSkill(prereq)
      if (!ps || ps.level < 1) return false
    }
    const wasZero = skill.level === 0
    skill.level++
    if (wasZero) player.skillsLearned++
    for (const [stat, val] of Object.entries(skill.effects)) {
      if (player[stat] !== undefined && typeof player[stat].value === 'number') {
        player[stat].value += val
      }
    }
    return true
  }

  const SAVE_KEY = 'bug-exe-skills'

  function save() {
    return saveWithVersion(SAVE_KEY, skills.value.map(s => ({ id: s.id, level: s.level })))
  }

  function load() {
    const data = loadWithVersion(SAVE_KEY)
    if (!data) return
    for (const saved of data) {
      const skill = _getSkill(saved.id)
      if (skill) skill.level = saved.level
    }
  }

  function reset() {
    skills.value.forEach(s => (s.level = 0))
    removeStorage(SAVE_KEY)
  }

  return {
    skills, skillsMap,
    getSkillsByCategory, canUpgrade, upgradeSkill,
    save, load, reset,
  }
})
