<script setup>
import { useSkillStore } from '@/stores/skill'

const skill = useSkillStore()
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
  </div>
</template>
