<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import config from '../config.js'
const API_BASE = config.API_BASE
const props = defineProps({
  deviceId: {
    type: String,
    required: true
  }
});
const rawApps = ref([]);
const loading = ref(false);
const error = ref(null);
// 计算处理后的应用数据
const processedApps = computed(() => {
  const now = new Date();
  return rawApps.value.map((app, index, arr) => {
    const startTime = new Date(app.timestamp);
    let endTime = null;
    let duration = null;

    // 当前正在运行的应用
    if (app.running) {
      duration = Math.floor((now - startTime) / 1000); // 计算从开始到现在的秒数
      return {
        ...app,
        startTime: app.timestamp,
        endTime: null, // 表示仍在运行
        duration: duration,
        isRunning: true
      };
    }
    // 已经结束的应用
    else {
      // 结束时间是下一个应用的时间戳
      endTime = index < arr.length - 1 ? new Date(arr[index + 1].timestamp) : now;
      duration = Math.floor((endTime - startTime) / 1000); // 转换为秒
      return {
        ...app,
        startTime: app.timestamp,
        endTime: endTime.toISOString(),
        duration: duration,
        isRunning: false
      };
    }
  });
});
// 获取最近使用的应用
const fetchRecentApps = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(`${API_BASE}/recent/${props.deviceId}`);
    if (!response.ok) throw new Error('获取最近应用失败');
    const data = await response.json();
    // 按时间降序排序（最新的在前面）
    rawApps.value = data.data.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );
  } catch (err) {
    error.value = `获取最近应用失败: ${err.message}`;
  } finally {
    loading.value = false;
  }
};
// 格式化持续时间为更友好的显示
const formatDuration = (seconds, isRunning) => {
  if (isRunning && seconds === null) return '运行中';
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小时${minutes}分钟`;
};
// 格式化时间为本地时间
const formatTime = (isoString) => {
  if (!isoString) return '运行中';
  const date = new Date(isoString);
  return date.toLocaleString();
};
// 自动刷新当前运行应用的持续时间
const now = ref(new Date());
onMounted(() => {
  const interval = setInterval(() => {
    now.value = new Date();
  }, 1000); // 每秒更新一次
  return () => clearInterval(interval);
});
onMounted(fetchRecentApps);
watch(() => props.deviceId, fetchRecentApps);
</script>
<template>
  <div class="mt-8 rounded-lg border-2 border-gray-200 shadow-md p-6 relative dark:border-gray-700">
    <!-- 标题和刷新按钮 -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">最近使用的应用</h3>
      <button @click="fetchRecentApps" class="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors dark:bg-[#181a1b] dark:text-gray-200 dark:hover:bg-gray-700">
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </span>
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      {{ error }}
    </div>

    <!-- 加载遮罩层 -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
      <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- 最近应用列表 -->
    <div class="overflow-x-auto transition-opacity duration-300" :class="{'opacity-50': loading}">
      <div v-if="!loading && recentApps.length === 0" class="text-center py-4 text-gray-500">
        暂无最近使用应用记录
      </div>

      <table v-if="recentApps.length > 0" class="min-w-full not-dark:divide-y divide-gray-200">
        <thead>
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">应用</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结束时间</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">持续时间</th>
        </tr>
        </thead>
        <tbody class="not-dark:divide-y divide-gray-50">
        <tr v-for="app in processedApps" :key="app._id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium  truncate max-w-xs">{{ app.appName }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm ">{{ formatTime(app.startTime) }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm ">{{ app.endTime ? formatTime(app.endTime) : '运行中' }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm ">{{ formatDuration(app.duration) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* 添加一些响应式样式 */
@media (max-width: 640px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
