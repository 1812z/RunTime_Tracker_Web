// composables/componentsFlag.js
import { ref } from 'vue';
import config from '../config.js';

const API_BASE = config.API_BASE;

/**
 * 页面配置管理 Composable
 * 用于获取和管理页面组件的显示配置以及时区设置
 */
export function pageConfig() {
    const pageConfigs = ref({
        config: {
            WEB_DEVICE_COUNT: true,      // 设备统计卡片
            WEB_COMMENT: true,           // 评论区
            WEB_AI_SUMMARY: true         // AI总结
            // 可以添加更多配置项
        },
        tzOffset: 8  // 默认时区偏移量（东8区）
    });

    const isLoading = ref(false);
    const error = ref(null);

    /**
     * 从服务器获取页面配置
     * 失败时保持默认配置
     */
    const fetchFlags = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const url = `${API_BASE}/pageConfig`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data && data.success) {
                // 更新配置项
                if (data.config) {
                    pageConfigs.value.config = {
                        ...pageConfigs.value.config,
                        ...data.config
                    };
                }

                // 更新时区偏移量
                if (typeof data.tzOffset === 'number') {
                    pageConfigs.value.tzOffset = data.tzOffset;
                }
            }

            console.log('页面配置加载成功:', pageConfigs.value);
        } catch (err) {
            console.error('获取页面配置失败:', err);
            error.value = `获取组件启用状态失败: ${err.message}`;
            // 失败时保持默认配置
        } finally {
            isLoading.value = false;
        }
    };

    return {
        pageConfigs,
        isLoading,
        error,
        fetchFlags
    };
}