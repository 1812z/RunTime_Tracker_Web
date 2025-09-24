<script setup>
import { ref, onMounted, watch } from 'vue';
import { useStats } from '../composables/useStats.js';
import StatsTypeSwitcher from "./StatsTypeSwitcher.vue";
import RecentApps from "./RecentApps.vue";
import UsageDetails from "./UsageDetails.vue";
import AppUsageChart from "./charts/AppUsageChart.vue";
import TimeUsageChart from "./charts/TimeUsageChart.vue";

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

const { stats, error, loading, fetchStats } = useStats();

const statsType = ref('daily');
const timeOffset = ref(0);

// 加载统计数据
const loadStats = async () => {
  await fetchStats(props.deviceId, {
    type: statsType.value,
    offset: timeOffset.value,
    date: props.date
  });
};

// 计算运行时间（分钟）
const calculateRunningTime = () => {
  if (!props.deviceInfo || !props.deviceInfo.runningSince) return 0;
  const startTime = new Date(props.deviceInfo.runningSince);
  const now = new Date();
  return Math.floor((now - startTime) / 60000);
};

// 获取设备统计信息
const getDeviceStats = () => {
  const defaultStats = {
    appCount: 0,
    totalUsageMinutes: 0,
    totalUsageHours: 0,
    topApp: '',
    topAppDuration: 0,
    busiestLabel: '',
    maxUsage: 0
  };

  // 如果统计数据不存在，返回默认统计信息
  if (!stats.value) return defaultStats;

  // 计算应用数量
  const appCount = Object.keys(stats.value.appStats).length;
  // 计算总使用时长（分钟和小时）
  const totalUsageMinutes = stats.value.totalUsage;
  const totalUsageHours = Math.floor(totalUsageMinutes / 60);

  // 查找使用时长最长的应用
  const [topApp, topAppDuration] = Object.entries(stats.value.appStats)
      .reduce(([maxApp, maxDur], [app, dur]) =>
          dur > maxDur ? [app, dur] : [maxApp, maxDur], ['', 0]);

  // 初始化最繁忙时段标签和最大使用量
  let busiestLabel = '';
  let maxUsage = 0;

  // 查找使用最频繁的时间段
  if (stats.value.timeStats && stats.value.timeStats.length > 0) {
    const maxIndex = stats.value.timeStats.reduce((maxIdx, val, idx, arr) =>
        val > arr[maxIdx] ? idx : maxIdx, 0);
    busiestLabel = stats.value.timeLabels[maxIndex];
    maxUsage = stats.value.timeStats[maxIndex];
  }


  return {
    appCount,
    totalUsageMinutes,
    totalUsageHours,
    topApp,
    topAppDuration,
    busiestLabel,
    maxUsage
  };
};

const getDateRangeText = () => {
  if (!stats.value?.dateRange) return '';

  const { start, end } = stats.value.dateRange;
  if (start === end) {
    return start;
  }
  return `${start} 至 ${end}`;
};

onMounted(loadStats);

watch(() => props.deviceId, loadStats);
watch(() => props.date, () => {
  if (statsType.value === 'daily') {
    loadStats();
  }
});
watch(statsType, loadStats);
watch(timeOffset, loadStats);
</script>

<template>
  <StatsTypeSwitcher
      v-model="statsType"
      v-model:offset="timeOffset"
      :date-range-text="getDateRangeText()"
  />

  <!-- 错误信息 -->
  <div v-show="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    {{ error }}
  </div>

  <!-- 主要内容区域 -->
  <div>

    <!-- 设备统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 hover:bg-blue-100 transition-colors duration-200 p-4 rounded-lg shadow-md dark:bg-blue-950 dark:hover:bg-blue-900">
        <p class="text-sm text-blue-700">应用总数</p>
        <p class="text-2xl font-bold">{{ getDeviceStats().appCount }}</p>
      </div>
      <div class="bg-green-50 hover:bg-green-100 transition-colors duration-200 p-4 rounded-lg shadow-md dark:bg-green-950 dark:hover:bg-green-900">
        <p class="text-sm text-green-700">总时间</p>
        <p class="text-2xl font-bold">{{ getDeviceStats().totalUsageHours }}小时</p>
      </div>
      <div class="bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200 p-4 rounded-lg shadow-md dark:bg-yellow-950 dark:hover:bg-yellow-900">
        <p class="text-sm text-yellow-700">最常用</p>
        <p class="text-2xl font-bold truncate" :title="getDeviceStats().topApp">
          {{ getDeviceStats().topApp || "暂无" }}
        </p>
      </div>
      <div class="bg-purple-50 hover:bg-purple-100 transition-colors duration-200 p-4 rounded-lg shadow-md dark:bg-purple-950 dark:hover:bg-purple-900">
        <p class="text-sm text-purple-700">最活跃时段</p>
        <p class="text-2xl font-bold">{{ getDeviceStats().busiestLabel || '-' }}</p>
      </div>
    </div>

    <!-- 当前使用情况 -->
    <div v-show="statsType === 'daily' && deviceInfo?.currentApp" class="mb-6">
      <div class="bg-blue-50 hover:bg-blue-100 transition-colors duration-200 p-4 rounded-lg shadow-md dark:bg-[#1d1f20] dark:hover:bg-blue-900/30">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-800">{{ deviceInfo?.running ? '当前应用' : '上次应用' }}</p>
            <p class="text-xl font-bold">{{ deviceInfo?.currentApp }}</p>
          </div>
          <div>
            <p class="text-sm text-blue-800">状态</p>
            <p class="text-xl font-bold">{{ deviceInfo?.running ? '运行中' : '已停止' }}</p>
          </div>
          <div>
            <p class="text-sm text-blue-800">已运行时间</p>
            <p class="text-xl font-bold">{{ calculateRunningTime() }} 分钟</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表组件 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <AppUsageChart
          :app-stats="stats?.appStats || {}"
          :total-usage="stats?.totalUsage || 0"
      />
      <TimeUsageChart
          :time-stats="stats?.timeStats || []"
          :time-labels="stats?.timeLabels || []"
          :time-dimension="stats?.timeDimension || ''"
      />
    </div>

    <!-- 使用详细使用数据组件 -->
    <UsageDetails :stats="stats || {}" :show-limit="10" />

    <!-- 最近使用的APP组件 -->
    <RecentApps v-show="statsType === 'daily'" :deviceId="deviceId" />
  </div>
</template>