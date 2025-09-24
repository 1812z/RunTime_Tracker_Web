<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController
} from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const props = defineProps({
  appStats: {
    type: Object,
    required: true
  },
  totalUsage: {
    type: Number,
    required: true
  }
});

const canvasRef = ref(null);

// 组件实例内的图表引用
const chartInstance = {
  current: null
};

const generateColors = (count) => {
  const colors = [];
  const hueStep = 360 / count;
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${i * hueStep}, 70%, 60%)`);
  }
  return colors;
};

const getTopAppsData = () => {
  if (!props.appStats) return { labels: [], data: [] };

  const appEntries = Object.entries(props.appStats)
      .map(([app, duration]) => ({ app, duration }))
      .sort((a, b) => b.duration - a.duration);

  const topApps = appEntries.slice(0, 8);
  const otherApps = appEntries.slice(8);
  const otherDuration = otherApps.reduce((sum, app) => sum + app.duration, 0);

  const labels = topApps.map(item => item.app);
  const data = topApps.map(item => item.duration);

  if (otherDuration > 0) {
    labels.push('其他');
    data.push(otherDuration);
  }

  return { labels, data };
};

const handleAppUsageChart = () => {
  const ctx = canvasRef.value;
  if (!ctx || !props.appStats) return;

  const { labels, data } = getTopAppsData();
  const colors = generateColors(labels.length);

  if (!chartInstance.current) {
    // 首次创建图表
    chartInstance.current = new Chart(ctx, {
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
        animation: {
          duration: 400,
          easing: 'easeInOutQuart'
        },
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
    chartInstance.current.data.labels = labels;
    chartInstance.current.data.datasets[0].data = data;
    chartInstance.current.data.datasets[0].backgroundColor = colors;
    chartInstance.current.update();
  }
};

// 更新图表
const updateCharts = () => {
  nextTick(() => {
    handleAppUsageChart();
  });
};

// 监听数据变化
watch(() => [props.appStats, props.totalUsage], () => {
  updateCharts();
}, { deep: true });

onMounted(() => {
  updateCharts();
});

onUnmounted(() => {
  if (chartInstance.current) {
    chartInstance.current.destroy();
    chartInstance.current = null;
  }
});
</script>

<template>
  <div class="p-4 rounded-lg border-2 border-gray-200 shadow-md dark:bg-[#181a1b] dark:border-gray-700" style="height: 300px;">
    <h3 class="text-lg font-medium mb-4">应用使用时间</h3>
    <div class="flex items-center justify-center" style="height: calc(100% - 2rem);">
      <canvas id="appUsageChart" ref="canvasRef"></canvas>
    </div>
  </div>
</template>