<script setup>
import DeviceStats from './DeviceStats.vue';

const props = defineProps({
  selectedDevice: {
    type: String,
    default: null
  },
  deviceInfo: {
    type: Object,
    default: null
  },
  selectedDate: {
    type: String,
    required: true
  },
  statsType: {
    type: String,
    required: true
  },
  timeOffset: {
    type: Number,
    required: true
  },
  showAiSummary: {
    type: Boolean,
    default: true
  },
  statsKey: {
    type: Number,
    required: true
  },
  isRefreshing: {
    type: Boolean,
    default: false
  },
  hasRealDevices: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['stats-update', 'refresh']);

const handleStatsUpdate = (stats) => {
  emit('stats-update', stats);
};
</script>

<template>
  <div class="bg-white rounded-lg not-dark:shadow-md p-6 sticky top-40 dark:bg-[#181a1b]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span v-if="selectedDevice !== 'summary'">{{ selectedDevice }} 使用统计</span>
        <span v-else>总览</span>
      </h2>

      <button
        v-if="selectedDevice"
        @click="emit('refresh')"
        class="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            :class="{ 'animate-spin': isRefreshing }"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          刷新
        </span>
      </button>
    </div>

    <!-- 刷新时显示加载遮罩 -->
    <transition name="fade">
      <div
        v-if="isRefreshing"
        class="absolute inset-0 bg-white/10 dark:bg-[#181a1b]/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg"
      >
        <div class="flex flex-col items-center gap-3 pb-[90%]">
          <svg class="animate-spin h-10 w-10 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">刷新中...</span>
        </div>
      </div>
    </transition>

    <DeviceStats
      v-if="hasRealDevices && selectedDevice"
      :key="statsKey"
      :device-id="selectedDevice"
      :device-info="deviceInfo"
      :date="selectedDate"
      :stats-type="statsType"
      :time-offset="timeOffset"
      @stats-update="handleStatsUpdate"
      :show-ai-summary="showAiSummary"
      :refresh-trigger="statsKey"
    />

    <!-- 空状态提示 -->
    <div v-else class="text-center py-8 text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      暂无设备数据
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.fade-enter-active {
  transition: opacity 0.2s ease-in;
}

.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
