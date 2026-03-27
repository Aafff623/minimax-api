import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface VoicePreset {
  id: string
  name: string
  voiceId: string
  language?: string
  description?: string
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// MiniMax TTS Voice Library - 音色库
// 基于 MiniMax speech-2.8-hd 模型的 327 音色选择
// 语言: zh-CN(中文), en-US(英文), ja-JP(日文), ko-KR(韩文) 等
const VOICE_PRESETS: VoicePreset[] = [
  // 中文女声 - 甜美可爱系
  {
    id: 'catgirl-suki',
    name: 'Suki',
    voiceId: 'zh-CN-Female-1',
    language: 'zh-CN',
    description: '甜美可爱，适合轻松治愈系对话',
  },
  // 中文女声 - 傲娇系
  {
    id: 'catgirl-yandere',
    name: 'Yandere',
    voiceId: 'zh-CN-Female-2',
    language: 'zh-CN',
    description: '傲娇可爱，有点小任性',
  },
  // 中文女声 - 活泼俏皮
  {
    id: 'catgirl-tsundere',
    name: 'Tsundere',
    voiceId: 'zh-CN-Female-3',
    language: 'zh-CN',
    description: '表面傲娇，内心温柔',
  },
  // 中文女声 - 轻柔软萌 (AI助手推荐)
  {
    id: 'catgirl-soft',
    name: 'Soft',
    voiceId: 'zh-CN-Female-4',
    language: 'zh-CN',
    description: '轻声软语，温柔治愈',
  },
  // 中文女声 - 成熟御姐
  {
    id: 'catgirl-mature',
    name: 'Mature',
    voiceId: 'zh-CN-Female-5',
    language: 'zh-CN',
    description: '成熟知性，从容优雅',
  },
  // 中文男声 - 阳光活力
  {
    id: 'catgirl-brave',
    name: 'Brave',
    voiceId: 'zh-CN-Male-1',
    language: 'zh-CN',
    description: '阳光活力，元气满满',
  },
  // 中文男声 - 磁性低沉
  {
    id: 'catgirl-deep',
    name: 'Deep',
    voiceId: 'zh-CN-Male-2',
    language: 'zh-CN',
    description: '磁性低沉，成熟稳重',
  },
  // 中文男声 - 清朗少年
  {
    id: 'catgirl-young',
    name: 'Young',
    voiceId: 'zh-CN-Male-3',
    language: 'zh-CN',
    description: '清朗少年，青春活力',
  },
  // 英文女声 - 优雅知性 (播客旁白推荐)
  {
    id: 'catgirl-elegant',
    name: 'Elegant',
    voiceId: 'en-US-Female-1',
    language: 'en-US',
    description: '优雅知性，温柔体贴',
  },
  // 英文女声 - 活泼开朗
  {
    id: 'catgirl-lively',
    name: 'Lively',
    voiceId: 'en-US-Female-2',
    language: 'en-US',
    description: '活泼开朗，充满能量',
  },
  // 英文男声 - 磁性低沉
  {
    id: 'catgirl-english-deep',
    name: 'English Deep',
    voiceId: 'en-US-Male-1',
    language: 'en-US',
    description: '磁性低沉，温暖治愈',
  },
  // 日文女声 - 日系甜妹
  {
    id: 'catgirl-miku',
    name: 'Miku',
    voiceId: 'ja-JP-Female-1',
    language: 'ja-JP',
    description: '日系甜音，清新治愈',
  },
  // 日文女声 - 温柔治愈
  {
    id: 'catgirl-japanese-warm',
    name: 'Japanese Warm',
    voiceId: 'ja-JP-Female-2',
    language: 'ja-JP',
    description: '温柔治愈，心灵慰藉',
  },
  // 日文男声 - 阳光少年
  {
    id: 'catgirl-japanese-sunny',
    name: 'Japanese Sunny',
    voiceId: 'ja-JP-Male-1',
    language: 'ja-JP',
    description: '阳光少年，热血青春',
  },
  // 韩文女声 - 俏皮可爱
  {
    id: 'catgirl-naughty',
    name: 'Naughty',
    voiceId: 'ko-KR-Female-1',
    language: 'ko-KR',
    description: '俏皮可爱，有点小腹黑',
  },
  // 韩文女声 - 温柔姐姐
  {
    id: 'catgirl-korean-sister',
    name: 'Korean Sister',
    voiceId: 'ko-KR-Female-2',
    language: 'ko-KR',
    description: '温柔姐姐，暖心关怀',
  },
]

export const useAgentStore = defineStore('agent', () => {
  const isVisible = ref(false)
  const isSpeaking = ref(false)
  const currentVoicePresetId = ref('female-sunny')
  const messages = ref<AgentMessage[]>([])

  const voicePresets = () => VOICE_PRESETS

  function getCurrentPreset(): VoicePreset | undefined {
    return VOICE_PRESETS.find((p) => p.id === currentVoicePresetId.value)
  }

  function setVoicePreset(presetId: string) {
    const preset = VOICE_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      currentVoicePresetId.value = presetId
    }
  }

  function setSpeaking(speaking: boolean) {
    isSpeaking.value = speaking
  }

  function addMessage(role: 'user' | 'assistant', content: string): AgentMessage {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
    }
    messages.value.push(message)
    return message
  }

  function clearMessages() {
    messages.value = []
  }

  function removeMessage(id: string) {
    const index = messages.value.findIndex((m) => m.id === id)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
  }

  function showAgent() {
    isVisible.value = true
  }

  function hideAgent() {
    isVisible.value = false
  }

  function toggleAgent() {
    isVisible.value = !isVisible.value
  }

  return {
    // State
    isVisible,
    isSpeaking,
    currentVoicePresetId,
    messages,
    // Getters
    voicePresets,
    getCurrentPreset,
    // Actions
    setVoicePreset,
    setSpeaking,
    addMessage,
    clearMessages,
    removeMessage,
    showAgent,
    hideAgent,
    toggleAgent,
  }
})
