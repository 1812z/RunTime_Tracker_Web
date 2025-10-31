export function formatTime(minutes) {
    const totalMinutes = parseFloat(minutes);

    // 格式化数字：整数不显示小数，非整数保留两位
    const formatNumber = (num) => num % 1 === 0 ? num : num.toFixed(2);

    if (totalMinutes < 60) {
        return `${formatNumber(totalMinutes)}分`;
    } else {
        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = Math.round(totalMinutes % 60);
        return `${hours}时${remainingMinutes}分`;
    }
}

export default formatTime;