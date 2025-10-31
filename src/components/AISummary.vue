<script setup>
import { ref, watch } from 'vue';
import config from "../config.js";

const API_BASE = config.API_BASE;

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:isExpanded']);

const summary = ref(null);
const timestamp = ref(null);
const loading = ref(false);
const error = ref(null);

// 获取AI总结
const fetchSummary = async () => {
  if (!props.deviceId) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_BASE}/ai/summary/${props.deviceId}`);
    const data = await response.json();

    if (data.success) {
      summary.value = data.summary;
      timestamp.value = data.timestamp;
    } else {
      error.value = data.message || '获取AI总结失败';
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试';
    console.error('Error fetching AI summary:', err);
  } finally {
    loading.value = false;
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 切换展开状态
const toggleExpanded = () => {
  emit('update:isExpanded', !props.isExpanded);
};

// 监听展开状态，展开时加载数据
watch(() => props.isExpanded, (expanded) => {
  if (expanded && !summary.value && !loading.value) {
    fetchSummary();
  }
});

// 监听设备ID变化，重新加载数据
watch(() => props.deviceId, () => {
  if (props.deviceId === "summary") return;

  // 重置数据但保持展开状态
  summary.value = null;
  timestamp.value = null;
  error.value = null;

  // 如果当前是展开状态，立即加载新设备的数据
  if (props.isExpanded) {
    fetchSummary();
  }
});
</script>

<template>
  <div class="mb-6">
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg shadow-md overflow-hidden">
      <!-- 折叠标题栏 -->
      <button
          @click="toggleExpanded"
          class="w-full p-4 flex items-center justify-between hover:bg-purple-100 dark:hover:bg-white/5 transition-colors"
      >
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span class="font-semibold text-purple-700 dark:text-purple-300">AI 智能分析</span>
          <span class="text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform duration-300 ease-in-out"
            :class="{ 'rotate-180': isExpanded }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- 可折叠内容 - 添加过渡动画 -->
      <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-[800px] opacity-100"
          leave-from-class="max-h-[800px] opacity-100"
          leave-to-class="max-h-0 opacity-0"
      >
        <div
            v-show="isExpanded"
            class="border-t border-purple-200 dark:border-purple-800 overflow-hidden"
        >
          <div class="p-4">
            <!-- 加载状态 -->
            <div v-if="loading" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span class="ml-3 text-gray-600 dark:text-gray-400">AI 分析中...</span>
            </div>

            <!-- 错误信息 -->
            <div v-else-if="error" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg flex items-start">
              <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1 min-w-0">
                <p class="font-medium break-words">{{ error }}</p>
              </div>
            </div>

            <!-- 总结内容 -->
            <div v-else-if="summary" class="space-y-3 animate-fade-in">
              <!-- 总结文本 -->
              <div class="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words text-sm">
                  {{ summary }}
                </p>
              </div>

              <!-- 时间戳 -->
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg class="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="truncate">生成时间: {{ formatTime(timestamp) }}</span>
              </div>
            </div>

            <!-- 无数据 -->
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-sm">暂无AI总结</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>