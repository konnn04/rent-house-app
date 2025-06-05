import { apiClient } from "./Api";

export const sendReportService = async (reportData) => {
    try {
        const response = await apiClient.post('/api/reports/', {
            reported_user: reportData.reported_user,
            type: reportData.type,
            reason: reportData.reason
        });

        // Kiểm tra response
        if (response.status === 201) {
            return {
                success: true,
                data: response.data
            };
        }

        return {
            success: false,
            error: response.data
        };

    } catch (error) {
        console.error("Error in sendReportService:", error.response?.data || error.message);
        throw new Error(
            error.response?.data?.detail ||
            error.response?.data?.message ||
            'Không thể gửi báo cáo'
        );
    }
};