import { ref } from 'vue';

/**
 * 获取本地日期字符串
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的日期字符串 (YYYY-MM-DD)
 */
const getLocalDateString = (date = new Date()) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date - offset);
    return localDate.toISOString().split('T')[0];
};

/**
 * 统计状态管理
 * @returns {Object} 统计相关状态和方法
 */
export function useStatsState() {
    const selectedDate = ref(getLocalDateString());
    const statsType = ref('daily');
    const timeOffset = ref(0);
    const stats = ref(null);

    /**
     * 获取日期范围文本
     * @returns {string} 日期范围文本
     */
    const getDateRangeText = () => {
        if (!stats.value?.dateRange) return '';
        const { start, end } = stats.value.dateRange;
        return start === end ? start : `${start} 至 ${end}`;
    };

    /**
     * 处理统计数据更新
     * @param {Object} newStats - 新的统计数据
     */
    const handleStatsUpdate = (newStats) => {
        stats.value = newStats;
    };

    return {
        selectedDate,
        statsType,
        timeOffset,
        stats,
        getDateRangeText,
        handleStatsUpdate
    };
}
