<script setup>
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    <div
      v-for="msg in toast.messages"
      :key="msg.id"
      class="px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-slide-in"
      :class="{
        'bg-emerald-600 text-white': msg.type === 'success',
        'bg-red-600 text-white': msg.type === 'error',
        'bg-slate-700 text-slate-200 border border-slate-600': msg.type === 'info',
        'bg-amber-600 text-white': msg.type === 'achievement',
      }"
    >
      <span v-if="msg.type === 'achievement'" class="mr-1">🏆</span>
      {{ msg.text }}
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
