<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
} from 'chart.js';

// 注册必要的Chart.js组件
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController);

const props = defineProps({
  timeStats: {
    type: Array,
    required: true,
    default: () => []
  },
  timeLabels: {
    type: Array,
    required: true,
    default: () => []
  },
  timeDimension: {
    type: String,
    default: 'hour'
  }
});

const canvasRef = ref(null);
// 使用对象存储图表实例，避免响应式问题
const chartInstance = {
  current: null
};

const getChartTitle = () => {
  const titles = {
    hour: '24小时使用统计',
    day: '每日使用统计',
    week: '每周使用统计'
  };
  return titles[props.timeDimension] || '使用统计';
};

const initChart = () => {
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx || !props.timeStats || props.timeStats.length === 0) return;

  // 确保先销毁旧图表
  if (chartInstance.current) {
    chartInstance.current.destroy();
  }

  chartInstance.current = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.timeLabels,
      datasets: [{
        label: '使用时间 (分钟)',
        data: props.timeStats,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: getChartTitle()
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} 分钟`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '分钟'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      animation: {
        duration: 400,
        easing: 'easeInOutQuart'
      }
    }
  });
};

const updateChart = () => {
  nextTick(() => {
    if (!chartInstance.current) {
      initChart();
    } else {
      if (props.timeLabels.length !== chartInstance.current.data.labels.length) {
        // 如果标签数量变化，重新创建图表
        initChart();
      } else {
        // 只更新数据
        chartInstance.current.data.labels = props.timeLabels;
        chartInstance.current.data.datasets[0].data = props.timeStats;
        chartInstance.current.update();
      }
    }
  });
};

// 监听数据变化
watch(() => [props.timeStats, props.timeLabels, props.timeDimension], () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  updateChart();
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
    <h3 class="text-lg font-medium mb-4">{{ getChartTitle() }}</h3>
    <div class="flex items-center justify-center" style="height: calc(100% - 2rem);">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
