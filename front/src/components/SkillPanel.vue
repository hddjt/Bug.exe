<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSkillStore } from '@/stores/skill'
import { usePlayerStore } from '@/stores/player'

const skill = useSkillStore()
const player = usePlayerStore()

const TASKS_KEY = 'bug-exe-daily-tasks'
const today = new Date().toDateString()

const saved = JSON.parse(localStorage.getItem(TASKS_KEY) || '{}')
const taskDate = ref(saved.date || '')
const taskWork = ref(saved.work || 0)
const taskBug = ref(saved.bug || 0)
const taskEarn = ref(saved.earn || 0)

if (taskDate.value !== today) {
  taskDate.value = today
  taskWork.value = 0
  taskBug.value = 0
  taskEarn.value = 0
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify({
    date: taskDate.value, work: taskWork.value, bug: taskBug.value, earn: taskEarn.value,
  }))
}

const TASK_GOALS = { work: 10, bug: 3, earn: 5000 }

const tasks = computed(() => [
  { label: '完成需求', current: taskWork.value, goal: TASK_GOALS.work, done: taskWork.value >= TASK_GOALS.work },
  { label: '修复 Bug', current: taskBug.value, goal: TASK_GOALS.bug, done: taskBug.value >= TASK_GOALS.bug },
  { label: '赚取收入', current: taskEarn.value, goal: TASK_GOALS.earn, done: taskEarn.value >= TASK_GOALS.earn },
])

const allDone = computed(() => tasks.value.every(t => t.done))

function trackAction(type) {
  if (taskDate.value !== today) {
    taskDate.value = today
    taskWork.value = 0
    taskBug.value = 0
    taskEarn.value = 0
  }
  if (type === 'work') taskWork.value++
  if (type === 'bug') taskBug.value++
  saveTasks()
}

function trackEarn(amount) {
  if (taskDate.value !== today) return
  taskEarn.value += amount
  saveTasks()
}

if (taskDate.value === today) {
  window.__dailyTasks = { trackAction, trackEarn }
}

onMounted(() => {
  window.__dailyTasks = { trackAction, trackEarn }
})
</script>

<template>
  <div>
    <h3 class="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
      已学技能
      <span class="text-xs text-amber-400">({{ skill.skillPoints }} 点)</span>
    </h3>
    <div class="space-y-1">
      <div
        v-for="s in skill.skills.filter(s => s.level > 0).slice(0, 8)"
        :key="s.id"
        class="flex justify-between items-center text-xs bg-slate-700 rounded px-2 py-1"
      >
        <span class="text-slate-300">{{ s.name }}</span>
        <span class="text-emerald-400">Lv.{{ s.level }}</span>
      </div>
      <div v-if="skill.skills.filter(s => s.level > 0).length === 0" class="text-xs text-slate-500 text-center py-2">
        去技能树学习技能吧
      </div>
    </div>
    <router-link
      to="/skills"
      class="block mt-2 text-xs text-amber-400 hover:text-amber-300 text-center"
    >
      查看完整技能树 &rarr;
    </router-link>

    <div class="mt-4 pt-3 border-t border-slate-700">
      <h3 class="text-sm font-bold text-slate-300 mb-2">
        📋 每日任务
        <span v-if="allDone" class="text-xs text-emerald-400 ml-1">✓ 已完成</span>
      </h3>
      <div class="space-y-2">
        <div v-for="t in tasks" :key="t.label" class="text-xs">
          <div class="flex justify-between text-slate-400 mb-0.5">
            <span :class="{ 'text-emerald-400 line-through': t.done }">{{ t.label }}</span>
            <span>{{ Math.min(t.current, t.goal) }}/{{ t.goal }}</span>
          </div>
          <div class="h-1 bg-slate-700 rounded overflow-hidden">
            <div class="h-full rounded transition-all" :class="t.done ? 'bg-emerald-500' : 'bg-amber-500'" :style="{ width: Math.min(t.current / t.goal * 100, 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
