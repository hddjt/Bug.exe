<script setup>
import { ref, watch } from 'vue'

const themes = [
  { key: 'default', label: '默认暗色', icon: '🌙' },
  { key: 'purple', label: '暗紫色', icon: '🔮' },
  { key: 'teal', label: '暗青绿', icon: '🌊' },
  { key: 'mono', label: '极简灰', icon: '⚪' },
]

const savedTheme = localStorage.getItem('bug-exe-theme') || 'default'
const currentTheme = ref(savedTheme)

const autoSave = ref(localStorage.getItem('bug-exe-autosave') !== 'false')
const fontSize = ref(parseInt(localStorage.getItem('bug-exe-fontsize')) || 14)

function applyTheme(key) {
  document.documentElement.setAttribute('data-theme', key)
  localStorage.setItem('bug-exe-theme', key)
}

function setTheme(key) {
  currentTheme.value = key
  applyTheme(key)
}

watch(autoSave, v => localStorage.setItem('bug-exe-autosave', v))
watch(fontSize, v => {
  localStorage.setItem('bug-exe-fontsize', v.toString())
  document.documentElement.style.fontSize = v + 'px'
})

applyTheme(currentTheme.value)
document.documentElement.style.fontSize = fontSize.value + 'px'
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 p-6" :data-theme="currentTheme">
    <header class="flex items-center mb-8">
      <router-link to="/game" class="text-slate-400 hover:text-white mr-4">&larr; 返回</router-link>
      <h1 class="text-2xl font-bold">⚙️ 设置</h1>
    </header>

    <div class="max-w-md space-y-6">
      <div class="bg-slate-800 rounded-lg p-4">
        <h2 class="font-bold text-slate-300 mb-3">主题</h2>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="t in themes"
            :key="t.key"
            @click="setTheme(t.key)"
            class="py-2 px-3 rounded text-sm cursor-pointer transition"
            :class="currentTheme === t.key ? 'bg-amber-600 text-white ring-2 ring-amber-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
          >
            {{ t.icon }} {{ t.label }}
          </button>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4">
        <h2 class="font-bold text-slate-300 mb-3">游戏</h2>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-400">自动存档 (30秒)</span>
          <button
            @click="autoSave = !autoSave"
            class="w-12 h-6 rounded-full transition-colors relative"
            :class="autoSave ? 'bg-emerald-600' : 'bg-slate-600'"
          >
            <div class="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all" :class="autoSave ? 'left-6' : 'left-0.5'"></div>
          </button>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4">
        <h2 class="font-bold text-slate-300 mb-3">字体大小</h2>
        <div class="flex items-center gap-3">
          <button @click="fontSize = Math.max(12, fontSize - 1)" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm cursor-pointer">A-</button>
          <span class="text-sm text-slate-300 w-8 text-center">{{ fontSize }}</span>
          <button @click="fontSize = Math.min(20, fontSize + 1)" class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm cursor-pointer">A+</button>
        </div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4">
        <h2 class="font-bold text-slate-300 mb-3">快捷键</h2>
        <div class="text-xs text-slate-400 space-y-1 font-mono">
          <div><span class="text-amber-400">1-6</span> 切换工作模式</div>
          <div><span class="text-amber-400">Q</span> 完成需求</div>
          <div><span class="text-amber-400">E</span> 修 Bug</div>
          <div><span class="text-amber-400">S</span> 手动存档</div>
        </div>
      </div>
    </div>
  </div>
</template>
