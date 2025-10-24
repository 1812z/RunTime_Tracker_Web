const config = {
    dev: {
        API_BASE: import.meta.env.VITE_API_BASE || 'https://api-usage.1812z.top/api', // 默认开发环境
        ADMIN_URL: import.meta.env.VITE_ADMIN_URL || 'https://runtime-tracker-admin.pages.dev/'
    },
    prod: {
        API_BASE: import.meta.env.VITE_API_BASE || 'https://api-usage.1812z.top/api', // 默认生产环境
        ADMIN_URL: import.meta.env.VITE_ADMIN_URL || 'https://runtime-tracker-admin.pages.dev/'
    }
};

export default process.env.NODE_ENV === 'production' ? config.prod : config.dev;
