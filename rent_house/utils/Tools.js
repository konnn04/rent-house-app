export const getTimeAgo = (createdAt) => {
    const now = new Date();
    const createdTime = new Date(createdAt);
    const diffInSeconds = Math.floor((now - createdTime) / 1000);

    if (diffInSeconds < 60) {
        return `${Math.ceil(diffInSeconds)} giây trước`;
    } else if (diffInSeconds < 3600) {
        return `${Math.ceil(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
        return `${Math.ceil(diffInSeconds / 3600)} giờ trước`;
    } else if (diffInSeconds < 604800) {
        return `${Math.ceil(diffInSeconds / 86400)} ngày trước`;
    } else if (diffInSeconds < 2592000) {
        return `${Math.ceil(diffInSeconds / 604800)} tuần trước`;
    } else if (diffInSeconds < 31536000) {
        return `${Math.ceil(diffInSeconds / 2592000)} tháng trước`;
    } else {
        return `${Math.ceil(diffInSeconds / 31536000)} năm trước`;
    }
};