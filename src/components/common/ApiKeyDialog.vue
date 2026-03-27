<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '~/components/common/Button.vue'
import Dialog from '~/components/common/Dialog.vue'
import Input from '~/components/common/Input.vue'
import { useApiKeyStore } from '~/stores/apikey'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const apiKeyStore = useApiKeyStore()

const inputKey = ref('')
const newGroupName = ref('')
const activeTab = ref<'single' | 'groups'>('single')

const showKey = ref(false)

const isValidKey = computed(() => {
  const key = inputKey.value.trim()
  // MiniMax API key format: typically starts with "eyJ" or similar
  // Or is a 32+ character string
  return key.length >= 20
})

function handleClose() {
  emit('update:modelValue', false)
}

function handleSave() {
  if (inputKey.value.trim()) {
    apiKeyStore.setApiKey(inputKey.value.trim())
    inputKey.value = ''
    handleClose()
  }
}

function handleSaveGroup() {
  if (newGroupName.value.trim() && inputKey.value.trim()) {
    apiKeyStore.addApiKeyGroup({
      name: newGroupName.value.trim(),
      apiKey: inputKey.value.trim(),
      isActive: apiKeyStore.apiKeyGroups.length === 0, // First group is active by default
    })
    inputKey.value = ''
    newGroupName.value = ''
  }
}

function handleRemoveGroup(id: string) {
  apiKeyStore.removeApiKeyGroup(id)
}

function handleSetActive(id: string) {
  apiKeyStore.setActiveGroup(id)
}

function handleClearAll() {
  apiKeyStore.clearAll()
  handleClose()
}
</script>

<template>
  <Dialog
    :model-value="modelValue"
    title="API Key 配置"
    width="480px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-6">
      <!-- Status Banner -->
      <div
        class="flex items-center gap-3 p-4 rounded-xl"
        :class="apiKeyStore.isConfigured
          ? 'bg-emerald-50 border border-emerald-200'
          : 'bg-amber-50 border border-amber-200'"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center"
          :class="apiKeyStore.isConfigured ? 'bg-emerald-100' : 'bg-amber-100'"
        >
          <svg
            class="w-5 h-5"
            :class="apiKeyStore.isConfigured ? 'text-emerald-600' : 'text-amber-600'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="apiKeyStore.isConfigured"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <p
            class="font-medium"
            :class="apiKeyStore.isConfigured ? 'text-emerald-800' : 'text-amber-800'"
          >
            {{ apiKeyStore.isConfigured ? 'API Key 已配置' : 'API Key 未配置' }}
          </p>
          <p
            class="text-sm"
            :class="apiKeyStore.isConfigured ? 'text-emerald-600' : 'text-amber-600'"
          >
            {{ apiKeyStore.isConfigured ? `当前 Key: ${apiKeyStore.maskedApiKey}` : '请配置您的 MiniMax API Key 以使用全部功能' }}
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="activeTab === 'single'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'"
          @click="activeTab = 'single'"
        >
          简单模式
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="activeTab === 'groups'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'"
          @click="activeTab = 'groups'"
        >
          分组管理
        </button>
      </div>

      <!-- Single Key Mode -->
      <div v-if="activeTab === 'single'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            MiniMax API Key
          </label>
          <div class="relative">
            <Input
              v-model="inputKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="输入您的 API Key"
              class="w-full pr-12"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              @click="showKey = !showKey"
            >
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="showKey"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <Button
          variant="gradient"
          class="w-full"
          :disabled="!isValidKey"
          @click="handleSave"
        >
          保存 API Key
        </Button>
      </div>

      <!-- Groups Mode -->
      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            分组名称
          </label>
          <Input
            v-model="newGroupName"
            placeholder="例如: 测试环境、生产环境"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div class="relative">
            <Input
              v-model="inputKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="输入 API Key"
              class="w-full pr-12"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              @click="showKey = !showKey"
            >
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="showKey"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <Button
          variant="gradient"
          class="w-full"
          :disabled="!isValidKey || !newGroupName.trim()"
          @click="handleSaveGroup"
        >
          添加分组
        </Button>

        <!-- Existing Groups -->
        <div v-if="apiKeyStore.apiKeyGroups.length > 0" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            已保存的分组
          </label>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="group in apiKeyStore.apiKeyGroups"
              :key="group.id"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
            >
              <button
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                :class="group.isActive
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-gray-300 hover:border-emerald-400'"
                @click="handleSetActive(group.id)"
              >
                <svg
                  v-if="group.isActive"
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">
                  {{ group.name }}
                </p>
                <p class="text-sm text-gray-500 font-mono truncate">
                  {{ group.apiKey.slice(0, 8) }}...{{ group.apiKey.slice(-4) }}
                </p>
              </div>
              <button
                class="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                @click="handleRemoveGroup(group.id)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Help Link -->
      <div class="pt-4 border-t border-gray-200">
        <a
          href="https://www.minimaxi.com/document/API"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          如何获取 MiniMax API Key？
        </a>
      </div>

      <!-- Clear All -->
      <div v-if="apiKeyStore.isConfigured" class="pt-2">
        <button
          class="w-full px-4 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          @click="handleClearAll"
        >
          清除所有 API Key
        </button>
      </div>
    </div>
  </Dialog>
</template>
