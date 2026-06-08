<script setup>
import { ref, nextTick, watch } from 'vue'
import { useLogStore } from '@/stores/log'

const log = useLogStore()
const logContainer = ref(null)

watch(
  () => log.messages.length,
  async () => {
    await nextTick()
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }
)

function typeClass(type) {
  return {
    info: 'text-slate-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
    event: 'text-amber-400',
    work: 'text-blue-400',
  }[type] ?? 'text-slate-400'
}
</script>

<template>
  <div class="h-full p-2 flex flex-col">
    <div class="text-xs text-slate-500 font-bold mb-1 shrink-0">日志</div>
    <div ref="logContainer" class="flex-1 overflow-y-auto space-y-0.5 text-xs font-mono">
      <div
        v-for="(msg, idx) in [...log.messages].reverse().slice(0, 100)"
        :key="msg.timestamp + '-' + idx"
        :class="typeClass(msg.type)"
      >
        {{ msg.text }}
      </div>
      <div v-if="log.messages.length === 0" class="text-slate-600">暂无日志</div>
    </div>
  </div>
</template>
