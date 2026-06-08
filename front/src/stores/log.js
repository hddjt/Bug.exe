import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLogStore = defineStore('log', () => {
  const messages = ref([])
  const maxMessages = 200

  function addLog(text, type = 'info') {
    messages.value.push({
      text,
      type,
      timestamp: Date.now(),
    })
    if (messages.value.length > maxMessages) {
      messages.value.splice(0, messages.value.length - maxMessages)
    }
  }

  function clear() {
    messages.value = []
  }

  return { messages, addLog, clear }
})
