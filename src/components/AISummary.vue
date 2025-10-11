<script setup>
import { ref, onMounted, watch } from 'vue';
import config from "../config.js";

const API_BASE = config.API_BASE;
const props = defineProps({
  deviceId: {
    type: String,
    required: true
  }
});

const summary = ref(null);
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

onMounted(fetchSummary);

watch(() => props.deviceId, fetchSummary);
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border-2 border-gray-200">
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
        <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI 智能总结
      </h3>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">加载中...</span>
    </div>

    <!-- 错误信息 -->
    <div v-else-if="error" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg flex items-start">
      <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <div>
        <p class="font-medium">{{ error }}</p>
      </div>
    </div>

    <!-- 总结内容 -->
    <div v-else-if="summary" class="space-y-4">
      <!-- 总结文本 -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {{ summary }}
        </p>
      </div>

      <!-- 时间戳 -->
      <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>生成时间: {{ formatTime(new Date()) }}</span>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>暂无AI总结</p>
    </div>
  </div>
</template>