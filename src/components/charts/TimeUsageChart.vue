<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue';
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
// 使用对象存储图表实例,避免响应式问题
const chartInstance = {
  current: null
};

const getChartTitle = () => {
  const titles = {
    hour: '24小时使用统计',
    day: '周使用统计',
    week: '月使用统计'
  };
  return titles[props.timeDimension] || '使用统计';
};

// 计算是否应该使用小时单位
const shouldUseHours = computed(() => {
  const maxValue = Math.max(...props.timeStats);
  return maxValue >= 60;
});

// 转换数据为合适的单位
const getConvertedData = () => {
  if (shouldUseHours.value) {
    return props.timeStats.map(v => v / 60);
  }
  return props.timeStats;
};

// 获取Y轴标签
const getYAxisLabel = () => {
  return shouldUseHours.value ? '小时' : '分钟';
};

const initChart = () => {
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx || !props.timeStats || props.timeStats.length === 0) return;

  // 确保先销毁旧图表
  if (chartInstance.current) {
    chartInstance.current.destroy();
  }

  const useHours = shouldUseHours.value;
  const convertedData = getConvertedData();
  const yAxisLabel = getYAxisLabel();

  chartInstance.current = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.timeLabels,
      datasets: [{
        label: `使用时间 (${yAxisLabel})`,
        data: convertedData,
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
            label: function (context) {
              // 获取原始分钟数
              const minuteValue = props.timeStats[context.dataIndex] || 0;
              if (minuteValue < 60) {
                return `${minuteValue.toFixed(2)}分钟`;
              } else {
                const hours = Math.floor(minuteValue / 60);
                const minutes = Math.round(minuteValue % 60);
                if (minutes === 0) {
                  return `${hours}小时`;
                }
                return `${hours}小时${minutes}分钟`;
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisLabel
          },
          ticks: {
            callback: function(value) {
              // Y轴刻度显示
              if (useHours) {
                if (value >= 2)
                  return value.toFixed(0);
                else return value.toFixed(1);
              }
              return Math.round(value);
            }
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
      // 检查是否需要重新创建图表（单位变化或标签数量变化）
      const currentUseHours = shouldUseHours.value;
      const oldLabel = chartInstance.current.options.scales.y.title.text;
      const newLabel = getYAxisLabel();

      if (props.timeLabels.length !== chartInstance.current.data.labels.length || oldLabel !== newLabel) {
        // 如果标签数量变化或单位变化，重新创建图表
        initChart();
      } else {
        // 只更新数据
        chartInstance.current.data.labels = props.timeLabels;
        chartInstance.current.data.datasets[0].data = getConvertedData();
        chartInstance.current.data.datasets[0].label = `使用时间 (${newLabel})`;
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