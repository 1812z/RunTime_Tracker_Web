<script setup>
import { onMounted, watch } from 'vue';
import { useStats } from '../composables/useStats.js';
import TimeUsageChart from "./charts/TimeUsageChart.vue";
import {formatTime} from "../composables/formatTime.js"

// 只需要时间、最活跃时段，eyetime模式
const props = defineProps({
  statsType: {
    type: String,
    default: 'daily'
  },
  timeOffset: {
    type: Number,
    default: 0
  },
  date: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['stats-update']);

const { stats, error, loading, fetchStats } = useStats();

// 加载统计数据，eyetime模式
const loadStats = async () => {
  await fetchStats('', {
    type: props.statsType,
    offset: props.timeOffset,
    date: props.date,
    mode: 'eyetime'
  });
  emit('stats-update', stats.value);
};

// 只返回eyetime数据统计
const getEyetimeStats = () => {
  const defaultStats = {
    totalUsageMinutes: 0,
    busiestLabel: '',
    maxUsage: 0
  };
  if (!stats.value) return defaultStats;
  const totalUsageMinutes = stats.value.totalUsage || 0;
  let busiestLabel = '';
  let maxUsage = 0;
  if (stats.value.timeStats && stats.value.timeStats.length > 0) {
    const maxIndex = stats.value.timeStats.reduce((maxIdx, val, idx, arr) =>
        val > arr[maxIdx] ? idx : maxIdx, 0);
    busiestLabel = stats.value.timeLabels[maxIndex];
    maxUsage = stats.value.timeStats[maxIndex];
  }
  return {
    totalUsageMinutes,
    busiestLabel,
    maxUsage
  };
};

onMounted(loadStats);

watch(() => props.statsType, loadStats);
watch(() => props.timeOffset, loadStats);
watch(() => props.date, loadStats);

watch(stats, (newStats) => {
  if (newStats) emit('stats-update', newStats);
}, { deep: true });
</script>

<template>
  <div>
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      {{ error }}
    </div>
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 transition-colors duration-200 p-4 rounded-lg shadow-md">
        <p class="text-sm text-green-700">屏幕总时间</p>
        <p class="text-xl md:text-2xl font-bold whitespace-nowrap">{{ formatTime(getEyetimeStats().totalUsageMinutes) }}</p>
      </div>
      <div class="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 transition-colors duration-200 p-4 rounded-lg shadow-md">
        <p class="text-sm text-purple-700">最活跃时段</p>
        <p class="text-xl md:text-2xl font-bold">{{ getEyetimeStats().busiestLabel || '-' }}</p>
      </div>
    </div>
    <TimeUsageChart
        :time-stats="stats?.timeStats || []"
        :time-labels="stats?.timeLabels || []"
        :time-dimension="stats?.timeDimension || ''"
        type="eye"
    />
  </div>
</template>