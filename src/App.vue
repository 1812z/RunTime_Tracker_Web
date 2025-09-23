<!--suppress HtmlDeprecatedAttribute -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import DeviceStats from './components/DeviceStats.vue';
import config from './config.js'
import GiscusComments from './components/GiscusComments.vue';
const showComments = ref(false);
const API_BASE = config.API_BASE
const devices = ref([]);
const selectedDevice = ref(null);
const error = ref(null);
const clientIp = ref('获取中...');
const refreshInterval = ref(null);
const toast = ref({
  show: false,
  message: '',
  type: 'error' // 可以是 'error' 或 'success'
});

// 获取本地日期字符串
const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000; // 获取时区偏移(毫秒)
  const localDate = new Date(date - offset);
  return localDate.toISOString().split('T')[0];
};

// 使用本地日期初始化
const selectedDate = ref(getLocalDateString());

// 添加日期转换函数
const localDateToUTC = (localDate) => {
  const date = new Date(localDate);
  // 添加时区偏移量以确保获取UTC日期
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split('T')[0];
};
// 获取最大日期(本地时间)
const getMaxDate = () => {
  return getLocalDateString();
};

// 获取客户端IP
const fetchClientIp = async () => {
  try {
    const response = await fetch(`${API_BASE}/ip`);
    const data = await response.json();
    clientIp.value = data.ip || '未知';
  } catch (err) {
    clientIp.value = '获取失败';
    console.error('获取IP地址失败:', err);
  }
};

// 获取设备列表
const showToast = (message, type = 'error') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000); // 3秒后自动消失
};

// 获取设备基础信息
const fetchDevices = async () => {
  try {
    const response = await fetch(`${API_BASE}/devices`);
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }
    devices.value = await response.json();
    if (devices.value.length > 0 && !selectedDevice.value) {
      selectedDevice.value = devices.value[0].device;
    }
  } catch (err) {
    showToast(`获取设备列表失败: ${err.message}`);
    console.error('获取设备列表错误:', err);
    devices.value = [];
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
  fetchClientIp();
  setupAutoRefresh();
});
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <!-- Toast 提示 -->
  <div v-if="toast.show" class="fixed top-4 right-4 z-50 w-auto transition-all duration-300" :class="{
      'animate-fade-in': toast.show,
      'animate-fade-out': !toast.show
    }">
    <div class="px-4 py-3 rounded-lg shadow-lg" :class="{
        'bg-red-50 border border-red-200 text-red-700': toast.type === 'error',
        'bg-green-50 border border-green-200 text-green-700': toast.type === 'success'
      }">
      <div class="flex items-start">
        <svg v-if="toast.type === 'error'" class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <svg v-else class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-sm">{{ toast.message }}</span>
      </div>
    </div>
  </div>
  <!-- 主要模块 -->
  <div class="bg-gray-100 min-h-screen rounded-lg dark:bg-[#1e2022]">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-3 pt-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        设备使用时间统计
      </h1>
      <div class="flex flex-col lg:flex-row gap-6 pb-6">
        <!-- 左侧模块区 -->
        <div class="space-y-6">
          <!-- 设备统计卡片 -->
          <div class="bg-white rounded-lg not-dark:shadow-md p-6 dark:bg-[#181a1b]">
            <div class="grid grid-cols-2 gap-4">
              <div class="border border-gray-200 dark:border-[#384456] rounded-lg p-4 text-center not-dark:shadow-md">
                <h3 class="text-gray-500 text-sm font-medium flex items-center justify-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  总设备数
                </h3>
                <p class="text-2xl font-bold mt-2">{{ devices.length }}</p>
              </div>
              <div class="border border-gray-200 dark:border-[#384456] rounded-lg p-4 text-center not-dark:shadow-md">
                <h3 class="text-gray-500 text-sm font-medium flex items-center justify-center gap-1">
                  <!--suppress HtmlDeprecatedAttribute -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  在线设备数
                </h3>
                <p class="text-2xl font-bold mt-2 text-green-600">
                  {{ devices.filter(d => d.running).length }}
                </p>
              </div>
            </div>
          </div>

          <!-- 在线互动 -->
          <div class="bg-white rounded-lg not-dark:shadow-md p-6 dark:bg-[#181a1b]">
            <div class=" flex justify-between items-center">
              <h2 class="text-xl font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                在线互动
              </h2>
              <!-- 添加开关按钮 -->
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="showComments" class="sr-only peer" aria-label="切换评论显示">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 dark:peer-focus:ring-1 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-500 after:border-gray-300 not-dark:after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-[#25282a] dark:peer-checked:bg-blue-900"></div>
                <span class="sr-only">切换评论显示</span>
              </label>
            </div>

            <!-- 评论区组件 -->
            <GiscusComments v-if="showComments" />
          </div>

          <!-- 设备列表 -->
          <div class="sticky top-4">
            <div class="bg-white rounded-lg not-dark:shadow-md p-6 dark:bg-[#181a1b]">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  设备列表
                </h2>
                <button @click="fetchDevices" class="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors dark:bg-[#181a1b] dark:text-gray-200 dark:hover:bg-gray-700">
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
                    class="border rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer dark:border-[#384456]"
                    :class="{'ring-2 ring-blue-500 dark:ring-gray-700': selectedDevice === device.device}"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-bold text-lg">{{ device.device }}</h3>
                      <p class="not-dark:text-gray-600 text-sm mt-1">
                        <span class="font-medium">当前应用:</span> {{ device.currentApp || '无' }}
                      </p>
                      <!-- 电量显示 -->
                      <div v-if="device.batteryLevel > 0" class="flex items-center mt-1">
                        <span class="text-gray-600 text-sm font-medium mr-1">电量:</span>
                        <div class="relative">
                          <!-- 电池外壳 -->
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-4 w-6"
                              viewBox="0 0 24 12"
                              fill="none"
                              stroke="#6b7280"
                              stroke-width="1.5"
                          >
                            <!-- 电池主体 -->
                            <rect x="0.5" y="0.5" width="18" height="11" rx="1.5" />
                            <!-- 电池正极 -->
                            <rect x="19" y="3" width="2" height="6" rx="0.5" />
                          </svg>
                        </div>
                        <span class="text-gray-600 text-xs ml-1">{{ device.batteryLevel }}%</span>
                      </div>
                    </div>
                    <span class="inline-block px-2 py-1 text-xs rounded-full"
                          :class="device.running ? 'bg-green-100 not-dark:text-green-800 dark:bg-green-950' : 'bg-red-100 not-dark:text-red-800 dark:bg-red-950'">
                      {{ device.running ? '运行中' : '已停止' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg not-dark:shadow-md p-6 mt-5 dark:bg-[#181a1b]">
              <div class="flex justify-between items-baseline">
                <!-- 标题和日期选择器 -->
                <h2 class="text-xl font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  统计日期
                </h2>
                <div>
                  <input
                      type="date"
                      v-model="selectedDate"
                      class="px-3 py-2 border border-gray-300 dark:border-[#384456] rounded-md not-dark:shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm hover:bg-gray-200 dark:hover:bg-gray-800"
                      :max=getMaxDate
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
        <!-- 右侧统计 -->
        <div class="flex-1 min-w-0"> <!-- 使用 flex-1 和 min-w-0 防止溢出 -->
          <div class="bg-white rounded-lg not-dark:shadow-md p-6 sticky top-40 dark:bg-[#181a1b]">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span v-if="selectedDevice">{{ selectedDevice }} 使用统计</span>
                <span v-else>请选择设备查看统计</span>
              </h2>

              <button v-if="selectedDevice" @click="refreshStats" class="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colorsdark:bg-gray-700 dark:bg-[#181a1b] dark:text-gray-200 dark:hover:bg-gray-700">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  刷新
                </span>
              </button>
            </div>

            <DeviceStats
                v-if="selectedDevice"
                :device-id="selectedDevice"
                :device-info="getSelectedDevice()"
                :date="selectedDate"
            />

            <div v-else class="text-center py-8 text-gray-500">
              请选择左侧设备以查看统计信息
            </div>
          </div>
        </div>
      </div>
      <footer class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-2 not-dark:shadow-sm dark:bg-[#34383a] dark:border-gray-950">
        <div class="container mx-auto flex justify-center items-center px-4">
          <!-- IP地址显示 -->
          <div class="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-4 dark:bg-[#1e2022]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="text-gray-700 font-mono dark:text-[#c2bea7]">{{ clientIp }}</span>
          </div>

          <!-- 版权信息 -->
          <p class="text-gray-500 text-sm mr-4 dark:text-gray-400">
            © 2025 Runtime Tracker V0.1
          </p>

          <!-- GitHub链接 -->
          <a href="https://github.com/1812z/RunTime_Tracker" target="_blank"
             class="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:underline transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>


footer {
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(10px);
}
</style>