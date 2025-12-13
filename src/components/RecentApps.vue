<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import config from '../config.js'
const API_BASE = config.API_BASE
const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  refreshTrigger: {
    type: Number,
    default: 0
  }
});
const recentApps = ref([]);
const error = ref(null);
const isExpanded = ref(false); // 控制展开收起状态
const showLimit = ref(5); // 默认显示的条数

// 计算处理后的应用数据
const processedApps = computed(() => {
  // 按时间戳降序排序
  const sortedApps = [...recentApps.value].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
  );

  return sortedApps.map((app, index, arr) => {
    const startTime = new Date(app.timestamp);
    let endTime = null;
    let duration = null;

    // 如果是第一个应用且正在运行，则计算到当前时间的持续时间
    if (app.running && index === 0) {
      duration = Math.floor((new Date() - startTime) / 1000);
    } else if (index > 0) {
      // 结束时间是前一个应用的时间戳（因为现在是降序排序）
      endTime = new Date(arr[index - 1].timestamp);
      duration = Math.floor((endTime - startTime) / 1000);
    }

    return {
      ...app,
      startTime: app.timestamp,
      endTime: endTime ? endTime.toISOString() : null,
      duration: duration
    };
  });
});

// 计算要显示的应用列表
const displayedApps = computed(() => {
  if (isExpanded.value || processedApps.value.length <= showLimit.value) {
    return processedApps.value;
  }
  return processedApps.value.slice(0, showLimit.value);
});

// 是否需要显示展开/收起按钮
const shouldShowToggle = computed(() => {
  return processedApps.value.length > showLimit.value;
});

// 切换展开/收起状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// 获取最近使用的应用
const fetchRecentApps = async () => {
  try {
    error.value = null;
    const response = await fetch(`${API_BASE}/recent/${props.deviceId}`);
    if (!response.ok) throw new Error('获取最近应用失败');
    const data = await response.json();
    // 不再反转数组，因为现在会在computed中排序
    recentApps.value = data.data;
  } catch (err) {
    error.value = `获取最近应用失败: ${err.message}`;
  }
};

// 格式化持续时间为更友好的显示
const formatDuration = (seconds) => {
  if (seconds === null) return '设备待机';
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小时${minutes}分钟`;
};

// 格式化时间为本地时间
const formatTime = (isoString) => {
  if (!isoString) return '未结束';
  const date = new Date(isoString);
  return date.toLocaleString();
};

onMounted(fetchRecentApps);
watch(() => props.deviceId, fetchRecentApps);
watch(() => props.refreshTrigger, fetchRecentApps);
</script>

<template>
  <div class="mt-8 rounded-lg border-2 border-gray-200 shadow-md p-6 relative dark:border-gray-700">
    <!-- 标题 -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">最近使用的应用</h3>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      {{ error }}
    </div>

    <!-- 最近应用列表 -->
    <div class="overflow-x-auto">
      <div v-if="recentApps.length === 0" class="text-center py-4 text-gray-500">
        暂无最近使用应用记录
      </div>

      <div v-if="recentApps.length > 0">
        <!-- 应用表格 -->
        <table class="min-w-full not-dark:divide-y divide-gray-200">
          <thead>
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">应用</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结束时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">持续时间</th>
          </tr>
          </thead>
          <tbody  class="not-dark:divide-y divide-gray-50">
          <tr v-for="app in displayedApps" :key="app._id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium truncate max-w-xs">{{ app.appName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatTime(app.startTime) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ app.endTime ? formatTime(app.endTime) : '运行中' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDuration(app.duration) }}</td>
          </tr>
          </tbody>
        </table>

        <!-- 展开/收起按钮 -->
        <div v-if="shouldShowToggle" class="flex justify-center mt-4">
          <button
              @click="toggleExpanded"
              class="flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
          >
            <template v-if="isExpanded">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
              收起 (显示前{{ showLimit }}条)
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              展开查看全部 ({{ processedApps.length }}条)
            </template>
          </button>
        </div>
      </div>
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