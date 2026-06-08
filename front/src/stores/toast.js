import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
  const messages = ref([])

  function add(text, type = 'info', duration = 3000) {
    const id = Date.now() + Math.random()
    messages.value.push({ id, text, type })
    setTimeout(() => {
      messages.value = messages.value.filter(m => m.id !== id)
    }, duration)
  }

  function success(text) { add(text, 'success') }
  function error(text) { add(text, 'error') }
  function info(text) { add(text, 'info') }
  function achievement(text) { add(text, 'achievement', 5000) }

  return { messages, add, success, error, info, achievement }
})
