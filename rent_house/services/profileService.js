import { apiClient } from './Api';
// Lấy profile công khai của người dùng
export const getUserProfileService = async (username) => {
    try {
        const response = await apiClient.get(`/api/profiles/${username}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching profile for user ${username}:`, error);
        throw new Error('Không thể lấy thông tin người dùng');
    }
};

// Follow người dùng khác
export const followUserService = async (userId) => {
    try {
        const response = await apiClient.post(`/api/follows/`, { followee: userId });
        return response.data;
    } catch (error) {
        console.error(`Error following user ${userId}:`, error);
        throw new Error('Không thể theo dõi người dùng');
    }
};

// Unfollow người dùng khác
export const unfollowUserService = async (userId) => {
    try {
        const response = await apiClient.delete(`/api/follows/${userId}/`);
        return response.data;
    } catch (error) {
        console.error(`Error unfollowing user ${userId}:`, error);
        throw new Error('Không thể hủy theo dõi người dùng');
    }
};

// Lấy bài viết của người dùng cụ thể
export const getUserPostsService = async (username, nextUrl = null) => {
    try {
        if (!nextUrl) {
            nextUrl = `/api/posts/?author_username=${username}`;
        }
        const response = await apiClient.get(nextUrl);
        return response.data;
    } catch (error) {
        console.error(`Error fetching posts for user ${username}:`, error);
        throw new Error('Không thể lấy bài viết của người dùng');
    }
}

// Lấy nhà của người dùng
export const getUserHouseService = async (username, nextUrl = null) => {
    try {
        if (!nextUrl) {
            nextUrl = `/api/houses/?owner_username=${username}`;
        }
        const response = await apiClient.get(nextUrl);
        return response.data;
    } catch (error) {
        console.error(`Error fetching house for user ${username}:`, error);
        throw new Error('Không thể lấy nhà của người dùng');
    }
};