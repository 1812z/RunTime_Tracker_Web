import { ref } from 'vue';

/**
 * Toast 提示功能
 * @returns {Object} Toast 状态和方法
 */
export function useToast() {
    const toast = ref({
        show: false,
        message: '',
        type: 'error'
    });

    /**
     * 显示 Toast 提示
     * @param {string} message - 提示消息
     * @param {string} type - 提示类型 ('error' | 'success')
     */
    const showToast = (message, type = 'error') => {
        toast.value = { show: true, message, type };
        setTimeout(() => {
            toast.value.show = false;
        }, 3000);
    };

    return {
        toast,
        showToast
    };
}