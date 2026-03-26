<script setup lang="ts">
export interface TemplateOption {
  value: string
  label: string
  icon: string
  thumbnail?: string
}

const templates: TemplateOption[] = [
  { value: 'wide-shot', label: '远景', icon: 'i-ph-mountains' },
  { value: 'close-up', label: '近景', icon: 'i-ph-user-focus' },
  { value: 'detail', label: '特写', icon: 'i-ph-eye' },
  { value: 'aerial', label: '航拍', icon: 'i-ph-drone' },
  { value: 'animation', label: '动画', icon: 'i-ph-film-strip' },
  { value: 'cinematic', label: '电影感', icon: 'i-ph-clapperboard' },
  { value: 'documentary', label: '纪录片', icon: 'i-ph-video' },
  { value: 'action', label: '动作', icon: 'i-ph-run' },
  { value: 'nature', label: '自然', icon: 'i-ph-tree' },
  { value: 'urban', label: '城市', icon: 'i-ph-buildings' },
  { value: 'abstract', label: '抽象', icon: 'i-ph-shapes' },
]

const selectedTemplate = defineModel<string>({
  default: 'cinematic',
})

function selectTemplate(value: string) {
  selectedTemplate.value = value
}
</script>

<template>
  <div class="template-selector">
    <div class="label flex items-center gap-2 mb-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
      视频模板
    </div>
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="template in templates"
        :key="template.value"
        type="button"
        class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200" :class="[
          selectedTemplate === template.value
            ? 'border-primary bg-primary text-white shadow-button'
            : 'border-border-light bg-white text-text-primary hover:border-primary/50 hover:bg-primary/5',
        ]"
        @click="selectTemplate(template.value)"
      >
        <span class="text-2xl" :class="[template.icon]" />
        <span class="text-xs font-medium">{{ template.label }}</span>
      </button>
    </div>
  </div>
</template>
