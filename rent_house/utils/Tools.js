// Chuyển đổi số thành chuỗi
export const formatDateToRelative = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds} giây trước`;
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    } else if (diffInSeconds < 604800) {
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    } else if (diffInSeconds < 2592000) {
        return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
    } else if (diffInSeconds < 31536000) {
        return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    } else {
        return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
    }
}

// Chuyển đổi số sang VND
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) {
        return '0 VND';
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}