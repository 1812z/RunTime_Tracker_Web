const config = {
    dev: {
        API_BASE: 'https://api-usage.1812z.top/api'
    },
    prod: {
        API_BASE: 'https://api-usage.1812z.top/api'
    }
}

export default process.env.NODE_ENV === 'production' ? config.prod : config.dev
