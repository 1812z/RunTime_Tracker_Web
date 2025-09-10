<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  BarController
} from 'chart.js';

// 注册 Chart.js 组件
Chart.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    DoughnutController,
    BarController
);

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  deviceInfo: {
    type: Object,
    default: null
  }
});

const API_BASE = 'http://127.0.0.1:3000/api';
const stats = ref(null);
const error = ref(null);
const appUsageChart = ref(null);
const hourlyUsageChart = ref(null);

// 获取设备统计信息
const fetchStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/stats/${props.deviceId}`);
    if (!response.ok) throw new Error('获取统计失败');
    stats.value = await response.json();

    // 更新图表
    updateCharts();
  } catch (err) {
    error.value = `获取统计信息失败: ${err.message}`;
  }
};

// 计算运行时间（分钟）
const calculateRunningTime = () => {
  if (!props.deviceInfo || !props.deviceInfo.runningSince) return 0;

  const startTime = new Date(props.deviceInfo.runningSince);
  const now = new Date();
  const diffMs = now - startTime;
  const diffMins = Math.floor(diffMs / 60000);

  return diffMins;
};

// 格式化持续时间
const formatDuration = (seconds) => {
  if (seconds < 60) return `小于1分钟`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小时${minutes}分`;
};

// 生成颜色
const generateColors = (count) => {
  const colors = [];
  const hueStep = 360 / count;
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${i * hueStep}, 70%, 60%)`);
  }
  return colors;
};

// 获取按时间排序的前8个应用及"其他"
const getTopAppsData = () => {
  if (!stats.value || !stats.value.appStats) return { labels: [], data: [] };

  // 转换为数组并按时间排序（降序）
  const appEntries = Object.entries(stats.value.appStats)
      .map(([app, duration]) => ({ app, duration }))
      .sort((a, b) => b.duration - a.duration);

  // 取前8个应用
  const topApps = appEntries.slice(0, 8);
  const otherApps = appEntries.slice(8);

  // 计算"其他"类别的时间总和
  const otherDuration = otherApps.reduce((sum, app) => sum + app.duration, 0);

  // 构建标签和数据数组
  const labels = topApps.map(item => item.app);
  const data = topApps.map(item => item.duration);

  // 如果有其他应用，添加"其他"类别
  if (otherDuration > 0) {
    labels.push('其他');
    data.push(otherDuration);
  }

  return { labels, data };
};

// 更新应用使用时间图表
const updateAppUsageChart = () => {
  const ctx = document.getElementById('appUsageChart');
  if (!ctx || !stats.value) return;

  const { labels, data } = getTopAppsData();
  const colors = generateColors(labels.length);

  // 销毁现有图表
  if (appUsageChart.value) {
    appUsageChart.value.destroy();
  }

  // 创建新图表
  appUsageChart.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value}分钟 (${percentage}%)`;
            }
          }
        }
      }
    }
  });
};

// 更新24小时使用图表
const updateHourlyUsageChart = () => {
  const ctx = document.getElementById('hourlyUsageChart');
  if (!ctx) return;

  const labels = Array.from({length: 24}, (_, i) => `${i}时`);
  const data = stats.value.hourlyStats;

  // 销毁现有图表
  if (hourlyUsageChart.value) {
    hourlyUsageChart.value.destroy();
  }

  // 创建新图表
  hourlyUsageChart.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '使用时间 (分钟)',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '分钟'
          }
        }
      }
    }
  });
};

// 更新所有图表
const updateCharts = () => {
  nextTick(() => {
    updateAppUsageChart();
    updateHourlyUsageChart();
  });
};

// 渲染详细使用数据
const renderUsageDetails = () => {
  if (!stats.value) return [];

  return Object.entries(stats.value.appStats)
      .map(([app, duration]) => ({
        app,
        duration,
        formattedDuration: formatDuration(duration * 60)
      }))
      .sort((a, b) => b.duration - a.duration); // 按使用时间排序
};

// 计算设备使用统计信息
const getDeviceStats = () => {
  if (!stats.value) return null;

  const appCount = Object.keys(stats.value.appStats).length;
  const totalUsageMinutes = stats.value.totalUsage;
  const totalUsageHours = Math.floor(totalUsageMinutes / 60);
  const avgDailyUsage = Math.round(totalUsageMinutes / 7); // 假设统计周期为一周

  // 找到使用时间最长的应用
  let topApp = '';
  let topAppDuration = 0;
  Object.entries(stats.value.appStats).forEach(([app, duration]) => {
    if (duration > topAppDuration) {
      topApp = app;
      topAppDuration = duration;
    }
  });

  // 计算最活跃的小时
  let busiestHour = 0;
  let maxHourlyUsage = 0;
  stats.value.hourlyStats.forEach((minutes, hour) => {
    if (minutes > maxHourlyUsage) {
      busiestHour = hour;
      maxHourlyUsage = minutes;
    }
  });

  return {
    appCount,
    totalUsageMinutes,
    totalUsageHours,
    avgDailyUsage,
    topApp,
    topAppDuration,
    busiestHour,
    maxHourlyUsage
  };
};

onMounted(() => {
  fetchStats();
});

// 监听设备ID变化
watch(() => props.deviceId, () => {
  fetchStats();
});

// 监听设备信息变化，重新计算运行时间
watch(() => props.deviceInfo, () => {
  // 当设备信息更新时，组件会自动重新渲染，显示最新的运行时间
});
</script>

<template>
  <div>
    <!-- 错误信息 -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      {{ error }}
    </div>

    <!-- 设备统计概览 -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 info-block">
        <p class="text-sm text-blue-800">应用总数</p>
        <p class="text-2xl font-bold">{{ getDeviceStats().appCount }}</p>
      </div>
      <div class="bg-green-50 info-block">
        <p class="text-sm text-green-800">总时间</p>
        <p class="text-2xl font-bold">{{ getDeviceStats().totalUsageHours }}小时</p>
      </div>
      <div class="bg-yellow-50 info-block">
        <p class="text-sm text-yellow-800">最常用</p>
        <p class="text-2xl font-bold truncate" :title="getDeviceStats().topApp">{{ getDeviceStats().topApp }}</p>
      </div>
      <div class="bg-purple-50 info-block">
        <p class="text-sm text-purple-800">最活跃时段</p>
        <p class="text-2xl font-bold">{{ getDeviceStats().busiestHour }}时</p>
      </div>
    </div>

    <!-- 当前使用情况 -->
    <div v-if="deviceInfo && deviceInfo.currentApp" class="mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-800">{{ deviceInfo.running ? '当前应用' : '上次应用' }}</p>
            <p class="text-xl font-bold">{{ deviceInfo.currentApp }}</p>
          </div>
          <div>
            <p class="text-sm text-blue-800">状态</p>
            <p class="text-xl font-bold">{{ deviceInfo.running ? '运行中' : '已停止' }}</p>
          </div>
          <div>
            <p class="text-sm text-blue-800">已运行时间</p>
            <p class="text-xl font-bold">{{ calculateRunningTime() }} 分钟</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white p-4 rounded-lg border border-gray-200" style="height: 300px;">
        <h3 class="text-lg font-medium mb-4">应用使用时间</h3>
        <div class="flex items-center justify-center" style="height: calc(100% - 2rem);">
          <canvas id="appUsageChart"></canvas>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200" style="height: 300px;">
        <h3 class="text-lg font-medium mb-4">24小时使用统计</h3>
        <div class="flex items-center justify-center" style="height: calc(100% - 2rem);">
          <canvas id="hourlyUsageChart"></canvas>
        </div>
      </div>
    </div>

    <!-- 详细使用数据 -->
    <div v-if="stats" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-lg font-medium mb-4">详细使用数据</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">应用</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用时间</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="usage in renderUsageDetails()" :key="usage.app">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ usage.app }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ usage.formattedDuration }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-block {
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}
</style>
