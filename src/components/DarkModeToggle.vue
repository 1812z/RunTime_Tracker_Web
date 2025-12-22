<script setup>
import { computed } from 'vue';
import { useDarkMode } from '../composables/useDarkMode.js';

const { mode, toggleDarkMode } = useDarkMode();

// 根据模式计算显示内容
const modeConfig = computed(() => {
  switch (mode.value) {
    case 'light':
      return {
        icon: 'sun',
        color: 'text-yellow-500',
        bgPulse: 'bg-yellow-500/20',
        nextMode: '点击切换到自动模式'
      };
    case 'auto':
      return {
        icon: 'auto',
        color: 'text-purple-500',
        bgPulse: 'bg-purple-500/20',
        nextMode: '点击切换到暗黑模式'
      };
    case 'dark':
      return {
        icon: 'moon',
        color: 'text-blue-400',
        bgPulse: 'bg-blue-500/20',
        nextMode: '点击切换到亮色模式'
      };
    default:
      return {
        icon: 'auto',
        color: 'text-purple-500',
        bgPulse: 'bg-purple-500/20',
        nextMode: '点击切换'
      };
  }
});
</script>

<template>
  <div class="fixed bottom-18 right-6 z-50">
    <button
      @click="toggleDarkMode"
      class="group relative flex items-center justify-center w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700"
    >
      <!-- 太阳图标 (亮色模式) -->
      <svg
        v-if="modeConfig.icon === 'sun'"
        xmlns="http://www.w3.org/2000/svg"
        :class="['h-6 w-6 transition-all duration-300', modeConfig.color]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      <!-- 自动图标 (跟随系统) -->
      <svg
        v-else-if="modeConfig.icon === 'auto'"
        xmlns="http://www.w3.org/2000/svg"
        :class="['h-6 w-6 transition-all duration-300', modeConfig.color]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>

      <!-- 月亮图标 (暗黑模式) -->
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        :class="['h-6 w-6 transition-all duration-300', modeConfig.color]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      <!-- 悬停提示 -->
      <span
        class="absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg"
      >
        <div class="font-semibold">{{ modeConfig.title }}</div>
        <div class="text-xs text-gray-300 mt-0.5">{{ modeConfig.nextMode }}</div>
      </span>

      <!-- 脉冲动画环 -->
      <span
        :class="['absolute inset-0 rounded-full animate-ping-slow', modeConfig.bgPulse]"
      ></span>
    </button>
  </div>
</template>

<style scoped>
/* 自定义脉冲动画 - 更慢更柔和 */
@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 按钮悬停效果 */
button:hover {
  transform: scale(1.05);
}

button:active {
  transform: scale(0.95);
}

/* 图标旋转动画 */
svg {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: rotate(0deg);
  }
}
</style>
