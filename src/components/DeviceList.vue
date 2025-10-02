<script setup>
import { defineProps, defineEmits } from 'vue';

// 定义 props
const props = defineProps({
  devices: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedDevice: {
    type: String,
    default: null
  }
});

// 定义 emits
const emit = defineEmits(['select-device', 'refresh-devices']);

// 选择设备
const selectDevice = (deviceId) => {
  emit('select-device', deviceId);
};

// 刷新设备列表
const handleRefresh = () => {
  emit('refresh-devices');
};

// 获取电池颜色
const getBatteryColor = (level, isCharging) => {
  if (isCharging) {
    return '#22c55e'; // 充电时显示绿色
  }
  if (level <= 20) {
    return '#ef4444'; // 低于20%显示红色
  }
  return '#6b7280'; // 正常状态显示灰色
};

// 获取电池文字样式类
const getBatteryTextClass = (level, isCharging) => {
  if (isCharging) {
    return 'text-green-600 dark:text-green-400';
  }
  if (level <= 20) {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-gray-600 dark:text-gray-400';
};
</script>

<template>
  <div class="bg-white rounded-lg not-dark:shadow-md p-6 dark:bg-[#181a1b]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        设备列表
      </h2>
      <button
          @click="handleRefresh"
          class="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </span>
      </button>
    </div>

    <div id="devicesList" class="space-y-3">
      <!-- 空状态 -->
      <div v-if="devices.length === 0" class="text-center py-8 text-gray-400">
        暂无设备数据
      </div>

      <!-- 设备卡片 -->
      <div
          v-for="device in devices"
          :key="device.device"
          @click="selectDevice(device.device)"
          class="border rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer dark:border-[#384456]"
          :class="{'ring-2 ring-blue-500 dark:ring-gray-700': selectedDevice === device.device}"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-bold text-lg">{{ device.device }}</h3>
            <p class="not-dark:text-gray-600 text-sm mt-1">
              <span class="font-medium">当前应用:</span> {{ device.currentApp || '无' }}
            </p>

            <!-- 动态电量显示 -->
            <div v-if="device.batteryLevel > 0" class="flex items-center mt-2">
              <span class="text-gray-600 text-sm font-medium mr-2">电量:</span>
              <div class="relative">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4.5 w-7"
                    viewBox="0 0 24 12"
                    fill="none"
                >
                  <!-- 电池外壳 -->
                  <rect
                      x="0.5"
                      y="0.5"
                      width="18"
                      height="11"
                      rx="3"
                      :stroke="getBatteryColor(device.batteryLevel, device.isCharging)"
                      stroke-width="1"
                      fill="white"
                      class="dark:fill-[#181a1b]"
                  />
                  <!-- 电池电量填充 (动态宽度) -->
                  <rect
                      x="2"
                      y="2"
                      :width="(device.batteryLevel / 100) * 14"
                      height="8"
                      rx="2"
                      :fill="getBatteryColor(device.batteryLevel, device.isCharging)"
                      :class="{'battery-charging': device.isCharging}"
                  />
                  <!-- 电池正极 -->
                  <rect
                      x="19"
                      y="3.5"
                      width="2"
                      height="5"
                      rx="1"
                      :fill="getBatteryColor(device.batteryLevel, device.isCharging)"
                  />
                </svg>
                <!-- 充电图标叠加 -->
                <svg
                    v-if="device.isCharging"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 absolute top-1/2 left-2/5 transform -translate-x-1/2 -translate-y-1/2"
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="black"
                    stroke-width="0.5"
                >
                  <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z"/>
                </svg>
              </div>
              <span
                  class="text-xs ml-2 font-medium"
                  :class="getBatteryTextClass(device.batteryLevel, device.isCharging)"
              >
                {{ device.batteryLevel }}%
                <span v-if="device.isCharging">⚡</span>
              </span>
            </div>
          </div>

          <!-- 运行状态 -->
          <span
              class="inline-block px-2 py-1 text-xs rounded-full"
              :class="device.running ? 'bg-green-100 not-dark:text-green-800 dark:bg-green-950' : 'bg-red-100 not-dark:text-red-800 dark:bg-red-950'"
          >
            {{ device.running ? '运行中' : '已停止' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes charging-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.battery-charging {
  animation: charging-pulse 1.5s ease-in-out infinite;
}
</style>