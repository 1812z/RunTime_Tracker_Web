<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
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
import config from '../config.js'
import RecentApps from "./RecentApps.vue";
import UsageDetails from "./UsageDetails.vue";

const API_BASE = config.API_BASE

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
  },
  date: {
    type: String,
    default: null
  }
});

const stats = ref(null);
const error = ref(null);
const chartInstances = {
  appUsage: null,
  hourlyUsage: null
};

// 获取设备统计信息
// 在fetchStats函数中添加获取时区偏移量的逻辑
const fetchStats = async () => {
  try {
    // 获取当前时区偏移量（分钟）
    const timezoneOffset = new Date().getTimezoneOffset();
    // 转换为小时格式（如+8, -5等）
    const offsetHours = -timezoneOffset / 60;
    const timezoneParam = `timezoneOffset=${offsetHours > 0 ? '+' : ''}${offsetHours}`;

    let url = `${API_BASE}/stats/${props.deviceId}?${timezoneParam}`;
    if (props.date) {
      const today = new Date().toISOString().split('T')[0];
      url = props.date === today
          ? `${API_BASE}/stats/${props.deviceId}?${timezoneParam}`
          : `${API_BASE}/stats/${props.deviceId}?date=${props.date}&${timezoneParam}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('获取统计失败');
    stats.value = await response.json();
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
  return Math.floor((now - startTime) / 60000);
};

// 格式化持续时间
const formatDuration = (seconds) => {
  if (seconds < 60) return `<1分`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}时${minutes}分`;
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
  if (!stats.value?.appStats) return { labels: [], data: [] };

  const appEntries = Object.entries(stats.value.appStats)
      .map(([app, duration]) => ({ app, duration }))
      .sort((a, b) => b.duration - a.duration);

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

// 初始化或更新应用使用图表
const handleAppUsageChart = () => {
  const ctx = document.getElementById('appUsageChart');
  if (!ctx || !stats.value) return;

  const { labels, data } = getTopAppsData();
  const colors = generateColors(labels.length);

  if (!chartInstances.appUsage) {
    // 首次创建图表
    chartInstances.appUsage = new Chart(ctx, {
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
          legend: { position: 'right' },
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
  } else {
    // 更新现有图表数据
    chartInstances.appUsage.data.labels = labels;
    chartInstances.appUsage.data.datasets[0].data = data;
    chartInstances.appUsage.data.datasets[0].backgroundColor = colors;
    chartInstances.appUsage.update();
  }
};

// 初始化或更新24小时使用图表
const handleHourlyUsageChart = () => {
  const ctx = document.getElementById('hourlyUsageChart');
  if (!ctx || !stats.value) return;

  const labels = Array.from({length: 24}, (_, i) => `${i}时`);
  const data = stats.value.hourlyStats;

  if (!chartInstances.hourlyUsage) {
    // 首次创建图表
    chartInstances.hourlyUsage = new Chart(ctx, {
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
            title: { display: true, text: '分钟' }
          }
        }
      }
    });
  } else {
    // 更新现有图表数据
    chartInstances.hourlyUsage.data.datasets[0].data = data;
    chartInstances.hourlyUsage.update();
  }
};

// 更新所有图表
const updateCharts = () => {
  nextTick(() => {
    handleAppUsageChart();
    handleHourlyUsageChart();
  });
};

// 计算设备统计信息
const getDeviceStats = () => {
  if (!stats.value) return null;

  const appCount = Object.keys(stats.value.appStats).length;
  const totalUsageMinutes = stats.value.totalUsage;
  const totalUsageHours = Math.floor(totalUsageMinutes / 60);

  // 找到使用时间最长的应用
  const [topApp, topAppDuration] = Object.entries(stats.value.appStats)
      .reduce(([maxApp, maxDur], [app, dur]) =>
          dur > maxDur ? [app, dur] : [maxApp, maxDur], ['', 0]);

  // 计算最活跃的小时
  const busiestHour = stats.value.hourlyStats
      .reduce((maxHour, minutes, hour) =>
          minutes > stats.value.hourlyStats[maxHour] ? hour : maxHour, 0);

  return {
    appCount,
    totalUsageMinutes,
    totalUsageHours,
    avgDailyUsage: Math.round(totalUsageMinutes / 7),
    topApp,
    topAppDuration,
    busiestHour,
    maxHourlyUsage: stats.value.hourlyStats[busiestHour]
  };
};

// 生命周期和监听
onMounted(fetchStats);
onUnmounted(() => {
  Object.values(chartInstances).forEach(chart => chart?.destroy());
});

watch(() => props.deviceId, fetchStats);
watch(() => props.date, fetchStats);
watch(() => props.deviceInfo, () => {});
</script>

<template>
  <!-- 错误信息 -->
  <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    {{ error }}
  </div>

  <!-- 设备统计概览 -->
  <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-blue-50 hover:bg-blue-100 transition-colors duration-200 info-block dark:bg-blue-950 dark:hover:bg-blue-900">
      <p class="text-sm text-blue-700">应用总数</p>
      <p class="text-2xl font-bold">{{ getDeviceStats().appCount }}</p>
    </div>
    <div class="bg-green-50 hover:bg-green-100 transition-colors duration-200 info-block dark:bg-green-950 dark:hover:bg-green-900">
      <p class="text-sm text-green-700">总时间</p>
      <p class="text-2xl font-bold">{{ getDeviceStats().totalUsageHours }}小时</p>
    </div>
    <div class="bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200 info-block dark:bg-yellow-950 dark:hover:bg-yellow-900">
      <p class="text-sm text-yellow-700">最常用</p>
      <p class="text-2xl font-bold truncate" :title="getDeviceStats().topApp">{{ getDeviceStats().topApp || "暂无" }}</p>
    </div>
    <div class="bg-purple-50 hover:bg-purple-100 transition-colors duration-200 info-block dark:bg-purple-950 dark:hover:bg-purple-900">
      <p class="text-sm text-purple-700">最活跃时段</p>
      <p class="text-2xl font-bold">{{ getDeviceStats().busiestHour }}时</p>
    </div>
  </div>

  <!-- 当前使用情况 -->
  <div v-if="deviceInfo?.currentApp" class="mb-6">
    <div class="bg-blue-50 hover:bg-blue-100 transition-colors duration-200 p-4 rounded-lg shadow-md dark:bg-[#1d1f20] dark:hover:bg-blue-900/30">
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

  <!-- 图表区 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="p-4 rounded-lg border-2 border-gray-200 shadow-md 181a1b dark:bg-[#181a1b] dark:border-gray-700" style="height: 300px;">
      <h3 class="text-lg font-medium mb-4">应用使用时间</h3>
      <div class="flex items-center justify-center" style="height: calc(100% - 2rem);">
        <canvas id="appUsageChart"></canvas>
      </div>
    </div>
    <div class="p-4 rounded-lg border-2 border-gray-200 shadow-md dark:bg-[#181a1b] dark:border-gray-700" style="height: 300px;">
      <h3 class="text-lg font-medium mb-4">24小时使用统计</h3>
      <div class="flex items-center justify-center" style="height: calc(100% - 2rem);">
        <canvas id="hourlyUsageChart"></canvas>
      </div>
    </div>
  </div>

  <!-- 使用详细使用数据组件 -->
  <UsageDetails :stats="stats" :show-limit="10" />

  <!-- 最近使用的APP组件 -->
  <RecentApps :deviceId="deviceId" />

</template>
<style scoped>

</style>