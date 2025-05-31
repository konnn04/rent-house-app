import { apiClient } from './Api';

// Lấy danh sách nhà của bản thân
export const getMyHousesService = async (nextUrl = null) => {
  try {
    if (!nextUrl) {
      nextUrl = '/api/houses/my_houses/';
    }
    const response = await apiClient.get(nextUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching my houses:', error);
    throw error;
  }
}

// Chi tiết nhà
export const getDetailHouseService = async (houseId) => {
  try {
    const response = await apiClient.get(`/api/houses/${houseId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching house details:', error);
    throw error;
  }
}

// Cập nhật thông tin nhà
export const updateHouseService = async (houseId, formData) => {
  try {
    const response = await apiClient.put(`/api/houses/${houseId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating house:', error);
    throw error;
  }
}

// Tạo nhà mới
export const createHouseService = async (formData) => {
  try {
    const response = await apiClient.post(`/api/houses/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating house:', error);
    throw error;
  }
}

// Lấy danh sách nhà với filter và phân trang (lazy loading)
export const getHousesService = async ({
  search = '',
  type = '',
  min_price = '',
  max_price = '',
  area = '',
  has_rooms = false,
  ordering = '-created_at',
  page = 1,
  page_size = 10,
  nextUrl = null,
} = {}) => {
  try {
    let url = '';
    if (nextUrl) {
      url = nextUrl;
    } else {
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (type) params.push(`type=${encodeURIComponent(type)}`);
      if (min_price) params.push(`min_price=${encodeURIComponent(min_price)}`);
      if (max_price) params.push(`max_price=${encodeURIComponent(max_price)}`);
      if (area) params.push(`area=${encodeURIComponent(area)}`);
      if (has_rooms) params.push(`has_rooms=true`);
      if (ordering) params.push(`ordering=${encodeURIComponent(ordering)}`);
      if (page) params.push(`page=${page}`);
      if (page_size) params.push(`page_size=${page_size}`);
      url = `/api/houses/?${params.join('&')}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching houses:', error);
    throw error;
  }
}

// Lấy đánh giá của nhà
export const getHouseRatingsService = async (houseId, nextUrl = null, minStar = 0) => {
  try {
    if (!nextUrl) {
      nextUrl = `/api/rates/?house_id=${houseId}${minStar > 0 ? `&min_star=${minStar}` : ''}`;
    }
    const response = await apiClient.get(nextUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
}

// Tạo đánh giá mới
export const createHouseRatingService = async (formData) => {
  try {
    const response = await apiClient.post(`/api/rates/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating house rating:', error);
    throw error;
  }
}