import { ref } from 'vue';
import config from '../config.js';

// 从配置文件中获取API基础路径
const API_BASE = config.API_BASE;

/**
 * 提供设备使用统计数据的自定义组合式函数
 * @returns {Object} 包含统计数据、错误状态、加载状态和获取统计方法的对象
 */
export function useStats() {
    // 响应式变量：存储统计结果
    const stats = ref(null);
    // 响应式变量：存储错误信息
    const error = ref(null);
    // 响应式变量：标记是否正在加载数据
    const loading = ref(false);

    /**
     * 计算当前时区偏移小时数
     * @returns {number} 时区偏移小时数
     */
    const getTimezoneOffset = () => {
        const offset = new Date().getTimezoneOffset();
        return -offset / 60;
    };

    /**
     * 获取设备每日使用统计数据
     * @param {string} deviceId - 设备ID
     * @param {string|null} date - 查询日期(格式YYYY-MM-DD)，默认为当天
     */
    const fetchDailyStats = async (deviceId, date = null) => {
        loading.value = true;
        error.value = null;

        try {
            // 获取时区偏移并构造查询参数
            const offsetHours = getTimezoneOffset();
            const timezoneParam = `timezoneOffset=${offsetHours > 0 ? '+' : ''}${offsetHours}`;

            // 根据是否指定日期构造不同URL
            let url = `${API_BASE}/stats/${deviceId}?${timezoneParam}`;
            if (date) {
                const today = new Date().toISOString().split('T')[0];
                url = date === today
                    ? `${API_BASE}/stats/${deviceId}?${timezoneParam}`
                    : `${API_BASE}/stats/${deviceId}?date=${date}&${timezoneParam}`;
            }

            // 发送请求并处理响应
            const response = await fetch(url);
            if (!response.ok) throw new Error('获取统计失败');

            const data = await response.json();
            stats.value = transformDailyData(data);
        } catch (err) {
            error.value = `获取统计信息失败: ${err.message}`;
        } finally {
            loading.value = false;
        }
    };

    /**
     * 获取设备每周使用统计数据
     * @param {string} deviceId - 设备ID
     * @param {number} weekOffset - 周偏移量(0表示本周)
     */
    const fetchWeeklyStats = async (deviceId, weekOffset = 0) => {
        loading.value = true;
        error.value = null;

        try {
            // 获取时区偏移并构造URL
            const offsetHours = getTimezoneOffset();
            const url = `${API_BASE}/weekly/${deviceId}?weekOffset=${weekOffset}&timezoneOffset=${offsetHours}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('获取周统计失败');

            const data = await response.json();
            stats.value = transformWeeklyData(data);
        } catch (err) {
            error.value = `获取周统计信息失败: ${err.message}`;
        } finally {
            loading.value = false;
        }
    };

    /**
     * 获取设备每月使用统计数据
     * @param {string} deviceId - 设备ID
     * @param {number} monthOffset - 月偏移量(0表示本月)
     */
    const fetchMonthlyStats = async (deviceId, monthOffset = 0) => {
        loading.value = true;
        error.value = null;

        try {
            // 获取时区偏移并构造URL
            const offsetHours = getTimezoneOffset();
            const url = `${API_BASE}/monthly/${deviceId}?monthOffset=${monthOffset}&timezoneOffset=${offsetHours}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('获取月统计失败');

            const data = await response.json();
            stats.value = transformMonthlyData(data);
        } catch (err) {
            error.value = `获取月统计信息失败: ${err.message}`;
        } finally {
            loading.value = false;
        }
    };

    /**
     * 转换每日统计数据为统一格式
     * @param {Object} data - 原始API响应数据
     * @returns {Object} 格式化后的统计数据
     */
    const transformDailyData = (data) => {
        return {
            type: 'daily',  // 数据类型标识
            dateRange: {    // 日期范围(开始和结束相同)
                start: data.date || new Date().toISOString().split('T')[0],
                end: data.date || new Date().toISOString().split('T')[0]
            },
            totalUsage: data.totalUsage,  // 总使用时长
            appStats: data.appStats,      // 各应用使用统计
            timeStats: data.hourlyStats,  // 按小时统计的使用数据
            timeLabels: Array.from({length: 24}, (_, i) => `${i}时`),  // 24小时标签
            timeDimension: 'hour'         // 时间维度标识
        };
    };

    /**
     * 转换每周统计数据为统一格式
     * @param {Object} data - 原始API响应数据
     * @returns {Object} 格式化后的统计数据
     */
    const transformWeeklyData = (data) => {
        // 计算各应用一周总使用时长
        const appStats = {};
        Object.entries(data.appDailyStats).forEach(([appName, dailyData]) => {
            appStats[appName] = Object.values(dailyData).reduce((sum, val) => sum + val, 0);
        });

        // 处理日期标签(格式:月/日)
        const dates = Object.keys(data.dailyTotals).sort();
        const timeLabels = dates.map(date => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        // 获取每日总使用时长
        const timeStats = dates.map(date => data.dailyTotals[date] || 0);
        // 计算一周总使用时长
        const totalUsage = Object.values(appStats).reduce((sum, val) => sum + val, 0);

        return {
            type: 'weekly',
            dateRange: data.weekRange,  // 周日期范围
            totalUsage,
            appStats,
            timeStats,
            timeLabels,
            timeDimension: 'day',  // 时间维度标识(天)
            rawData: data          // 保留原始数据
        };
    };

    /**
     * 转换每月统计数据为统一格式
     * @param {Object} data - 原始API响应数据
     * @returns {Object} 格式化后的统计数据
     */
    const transformMonthlyData = (data) => {
        // 计算各应用一月总使用时长
        const appStats = {};
        Object.entries(data.appDailyStats || {}).forEach(([appName, dailyData]) => {
            appStats[appName] = Object.values(dailyData).reduce((sum, val) => sum + val, 0);
        });

        // 处理日期标签(格式:月/日)
        const dates = Object.keys(data.dailyTotals || {}).sort();
        const timeLabels = dates.map(date => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        // 获取每日总使用时长
        const timeStats = dates.map(date => data.dailyTotals[date] || 0);
        // 计算一月总使用时长
        const totalUsage = Object.values(appStats).reduce((sum, val) => sum + val, 0);

        return {
            type: 'monthly',
            dateRange: data.monthRange,  // 月日期范围
            totalUsage,
            appStats,
            timeStats,
            timeLabels,
            timeDimension: 'week',  // 时间维度标识
            rawData: data          // 保留原始数据
        };
    };

    /**
     * 通用统计获取方法(根据类型调用不同具体方法)
     * @param {string} deviceId - 设备ID
     * @param {Object} options - 配置选项
     * @param {string} [options.type='daily'] - 统计类型(daily/weekly/monthly)
     * @param {number} [options.offset=0] - 时间偏移量
     * @param {string} [options.date=null] - 指定日期(仅daily类型有效)
     */
    const fetchStats = async (deviceId, options = {}) => {
        const { type = 'daily', offset = 0, date = null } = options;
        switch (type) {
            case 'daily':
                await fetchDailyStats(deviceId, date);
                break;
            case 'weekly':
                await fetchWeeklyStats(deviceId, offset);
                break;
            case 'monthly':
                await fetchMonthlyStats(deviceId, offset);
                break;
            default:
                error.value = '未知的统计类型';
        }
    };

    // 暴露给外部使用的属性和方法
    return {
        stats,      // 统计结果数据
        error,      // 错误信息
        loading,    // 加载状态
        fetchStats  // 获取统计的通用方法
    };
}
