import { ref, computed, onMounted, onUnmounted } from 'vue';
import config from '../config.js';

const API_BASE = config.API_BASE;

const OVERVIEW_DEVICE = {
    device: 'summary',
    currentApp: '不告诉你'
};

/**
 * 设备管理功能
 * @param {Function} onError - 错误处理回调
 * @param {Object} config - 配置对象
 * @returns {Object} 设备相关状态和方法
 */
export function useDevices(onError, { showSummary }) {
    const devices = ref([]);
    const selectedDevice = ref(null);
    const clientIp = ref('获取中...');
    const refreshInterval = ref(null);
    const isRefreshing = ref(false);
    const statsKey = ref(0);

    const hasRealDevices = computed(() => {
        return devices.value.some(d => d.device !== 'summary');
    });

    /**
     * 获取客户端 IP 地址
     */
    const fetchClientIp = async () => {
        try {
            const response = await fetch(`${API_BASE}/ip`);
            const data = await response.json();
            clientIp.value = data.ip || '未知';
        } catch (err) {
            clientIp.value = '获取失败';
            console.error('获取IP地址失败:', err);
        }
    };

    /**
     * 获取设备列表
     */
    const fetchDevices = async () => {
        try {
            const response = await fetch(`${API_BASE}/devices`);
            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }
            const realDevices = await response.json();

            // 根据配置决定是否添加 summary 虚拟设备
            if (showSummary.value) {
                devices.value = [OVERVIEW_DEVICE, ...realDevices];
            } else {
                devices.value = realDevices;
            }

            if (devices.value.length > 0 && !selectedDevice.value) {
                selectedDevice.value = devices.value[0].device;
            }
        } catch (err) {
            onError?.(`获取设备列表失败: ${err.message}`);
            console.error('获取设备列表错误:', err);
            devices.value = [];
        }
    };

    /**
     * 刷新统计（通过改变 key 强制重新渲染组件）
     */
    const refreshStats = () => {
        if (selectedDevice.value) {
            isRefreshing.value = true;
            statsKey.value++;
            setTimeout(() => {
                isRefreshing.value = false;
            }, 500);
        }
    };

    /**
     * 设置自动刷新
     */
    const setupAutoRefresh = () => {
        if (refreshInterval.value) {
            clearInterval(refreshInterval.value);
        }
        refreshInterval.value = setInterval(() => {
            if (selectedDevice.value) {
                fetchDevices();
            }
        }, 30000);
    };

    /**
     * 获取选中设备的信息
     */
    const getSelectedDevice = () => {
        if (!selectedDevice.value) return null;
        return devices.value.find(device => device.device === selectedDevice.value) || null;
    };

    // 生命周期管理
    onUnmounted(() => {
        if (refreshInterval.value) {
            clearInterval(refreshInterval.value);
        }
    });

    return {
        devices,
        selectedDevice,
        clientIp,
        isRefreshing,
        statsKey,
        hasRealDevices,
        fetchClientIp,
        fetchDevices,
        refreshStats,
        setupAutoRefresh,
        getSelectedDevice
    };
}
