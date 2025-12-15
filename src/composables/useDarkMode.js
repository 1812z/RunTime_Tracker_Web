import { ref, watch, onMounted } from 'vue';

/**
 * 暗黑模式管理
 * 支持三种模式：'light' | 'dark' | 'auto'
 * @returns {Object} 暗黑模式状态和切换方法
 */
export function useDarkMode() {
    const isDark = ref(false);
    // 模式：'light' | 'dark' | 'auto'
    const mode = ref('auto');

    /**
     * 获取系统主题偏好
     */
    const getSystemPreference = () => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    /**
     * 初始化暗黑模式
     * 从 localStorage 读取用户偏好，如果没有则使用自动模式
     */
    const initDarkMode = () => {
        const stored = localStorage.getItem('themeMode');

        if (stored && ['light', 'dark', 'auto'].includes(stored)) {
            mode.value = stored;
        } else {
            mode.value = 'auto';
        }

        updateDarkMode();
    };

    /**
     * 根据当前模式更新暗黑模式状态
     */
    const updateDarkMode = () => {
        if (mode.value === 'auto') {
            isDark.value = getSystemPreference();
        } else {
            isDark.value = mode.value === 'dark';
        }
        applyDarkMode();
    };

    /**
     * 应用暗黑模式到 DOM
     */
    const applyDarkMode = () => {
        if (isDark.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    /**
     * 切换暗黑模式（三态循环）
     * light → auto → dark → light
     */
    const toggleDarkMode = () => {
        if (mode.value === 'light') {
            mode.value = 'auto';
        } else if (mode.value === 'auto') {
            mode.value = 'dark';
        } else {
            mode.value = 'light';
        }
    };

    /**
     * 设置为跟随系统
     */
    const setAutoMode = () => {
        mode.value = 'auto';
    };

    // 监听模式变化，保存到 localStorage 并更新暗黑模式
    watch(mode, (newValue) => {
        localStorage.setItem('themeMode', newValue);
        updateDarkMode();
    });

    // 监听系统主题变化
    onMounted(() => {
        initDarkMode();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            // 只有在自动模式下才跟随系统
            if (mode.value === 'auto') {
                updateDarkMode();
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        // 清理监听器
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    });

    return {
        isDark,
        mode,
        toggleDarkMode,
        setAutoMode
    };
}
