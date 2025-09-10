const config = {
    dev: {
        API_BASE: 'http://127.0.0.1:3000/api'
    },
    prod: {
        API_BASE: 'https://api-usage.1812z.top'
    }
}

export default process.env.NODE_ENV === 'production' ? config.prod : config.dev
