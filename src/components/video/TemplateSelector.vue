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
    <div class="text-sm text-gray-6 mb-2">
      视频模板
    </div>
    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="template in templates"
        :key="template.value"
        type="button"
        class="flex flex-col items-center gap-1 p-3 rounded-lg border transition-all"
        :class="[
          selectedTemplate === template.value
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-2 hover:border-gray-4 text-gray-6',
        ]"
        @click="selectTemplate(template.value)"
      >
        <span class="text-lg" :class="[template.icon]" />
        <span class="text-xs">{{ template.label }}</span>
      </button>
    </div>
  </div>
</template>
