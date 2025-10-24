<script setup>
import { computed } from 'vue';
import config from '../config.js';

// 判断是否显示管理按钮（可以根据实际需求添加权限判断）
const showAdminButton = computed(() => {
  // 这里可以添加权限判断逻辑
  return true;
});

const handleAdminClick = () => {
  // 跳转到管理后台
  window.open(`${config.ADMIN_URL}`, '_blank');
};
</script>

<template>
  <header class="w-full">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <!-- 桌面端布局 -->
      <div class="hidden sm:flex items-center justify-between">
        <!-- 左侧占位 -->
        <div class="w-32"></div>

        <!-- 中间标题 -->
        <h1 class="text-3xl lg:text-4xl font-bold flex items-center justify-center gap-3">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 lg:h-10 lg:w-10 text-blue-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            设备使用时间统计
          </span>
        </h1>

        <!-- 右侧管理按钮 -->
        <div class="w-32 flex justify-end">
          <button
              v-if="showAdminButton"
              @click="handleAdminClick"
              class="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium shadow-sm hover:bg-gray-200 hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center gap-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span class="hidden lg:inline">管理后台</span>
          </button>
        </div>
      </div>

      <!-- 移动端布局 -->
      <div class="sm:hidden">
        <div class="flex items-center justify-between gap-2">
          <!-- 标题 -->
          <h1 class="text-xl font-bold flex items-center gap-2 flex-1 min-w-0">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-blue-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              设备使用统计
            </span>
          </h1>

          <!-- 管理按钮 -->
          <button
              v-if="showAdminButton"
              @click="handleAdminClick"
              class="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium shadow-sm active:scale-95 active:bg-gray-200 transition-all duration-150 flex items-center gap-1.5 flex-shrink-0 dark:bg-gray-800 dark:text-gray-200 dark:active:bg-gray-700"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>管理</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 渐变文字效果 */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}
</style>