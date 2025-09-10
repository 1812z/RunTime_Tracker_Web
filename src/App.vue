<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import DeviceStats from './components/DeviceStats.vue';
import config from './config.js'

const API_BASE = config.API_BASE
const devices = ref([]);
const selectedDevice = ref(null);
const error = ref(null);

const refreshInterval = ref(null);

// 获取设备列表
const fetchDevices = async () => {
  try {
    const response = await fetch(`${API_BASE}/devices`);
    devices.value = await response.json();

    if (devices.value.length > 0 && !selectedDevice.value) {
      selectedDevice.value = devices.value[0].device;
    }
  } catch (err) {
    error.value = `请求失败: ${err.message}`;
  }
};


// 选择设备
const selectDevice = (deviceId) => {
  selectedDevice.value = deviceId;
};

// 刷新统计
const refreshStats = () => {
  if (selectedDevice.value) {
    // 这将触发 DeviceStats 组件重新获取数据
    const temp = selectedDevice.value;
    selectedDevice.value = null;
    setTimeout(() => {
      selectedDevice.value = temp;
    }, 0);
  }
};

// 设置自动刷新
const setupAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }

  refreshInterval.value = setInterval(() => {
    if (selectedDevice.value) {
      fetchDevices();
    }
  }, 30000); // 每30秒刷新一次
};

// 获取选中设备的信息
const getSelectedDevice = () => {
  if (!selectedDevice.value) return null;
  return devices.value.find(device => device.device === selectedDevice.value) || null;
};

onMounted(() => {
  fetchDevices();
  setupAutoRefresh();
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

</script>
<template>
  <div class="bg-gray-100 min-h-screen rounded-lg">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-center mb-8 text-blue-600 pt-6">设备使用统计</h1>

      <div class="flex flex-col lg:flex-row gap-6 pb-6">
        <!-- 左侧模块区 -->
        <div class="space-y-6">
          <!-- 设备统计卡片 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="border rounded-lg p-4 text-center shadow-md">
                <h3 class="text-gray-500 text-sm font-medium">总设备数</h3>
                <p class="text-2xl font-bold mt-2">{{ devices.length }}</p>
              </div>
              <div class="border rounded-lg p-4 text-center shadow-md">
                <h3 class="text-gray-500 text-sm font-medium">在线设备数</h3>
                <p class="text-2xl font-bold mt-2 text-green-600">
                  {{ devices.filter(d => d.running).length }}
                </p>
              </div>
            </div>
          </div>

          <!-- 设备列表 -->
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">设备列表</h2>
              <button @click="fetchDevices" class="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  刷新
                </span>
              </button>
            </div>
            <div id="devicesList" class="space-y-3">
              <!-- 设备卡片将通过JS动态加载 -->
              <div v-if="devices.length === 0" class="text-center py-8 text-gray-400">暂无设备数据</div>
              <div
                  v-for="device in devices"
                  :key="device.device"
                  @click="selectDevice(device.device)"
                  class="border rounded-lg p-4 hover:bg-gray-100 transition-shadow cursor-pointer"
                  :class="{'ring-2 ring-blue-500': selectedDevice === device.device}"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-bold text-lg">{{ device.device }}</h3>
                    <p class="text-gray-600 text-sm mt-1">
                      <span class="font-medium">当前应用:</span> {{ device.currentApp || '无' }}
                    </p>
                  </div>
                  <span class="inline-block px-2 py-1 text-xs rounded-full"
                        :class="device.running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ device.running ? '运行中' : '已停止' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧统计 -->
        <div class="flex-1 min-w-0"> <!-- 使用 flex-1 和 min-w-0 防止溢出 -->
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">
                <span v-if="selectedDevice">{{ selectedDevice }} 使用统计</span>
                <span v-else>请选择设备查看统计</span>
              </h2>
              <button
                  v-if="selectedDevice"
                  @click="refreshStats"
                  class="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  刷新
                </span>
              </button>
            </div>

            <DeviceStats v-if="selectedDevice" :device-id="selectedDevice" :device-info="getSelectedDevice()" />

            <div v-else class="text-center py-8 text-gray-500">
              请选择左侧设备以查看统计信息
            </div>
          </div>
        </div>
      </div>
      <footer class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4 shadow-sm">
        <div class="container mx-auto text-center">
          <p class="text-gray-500 text-sm">
            © 2025 Runtime Tracker ·
            <a href="https://github.com/1812z/RunTime_Tracker"
               target="_blank"
               class="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
</style>
