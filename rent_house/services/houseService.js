import { apiClient } from './Api';

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

export const getDetailHouseService = async (houseId) => {
  try {
    const response = await apiClient.get(`/api/houses/${houseId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching house details:', error);
    throw error;
  }
}

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

export const deleteHouseService = async (houseId) => {
  try {
    const response = await apiClient.delete(`/api/houses/${houseId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting house:', error);
    throw error;
  }
}

export const getHousesService = async ({
  search = '',
  type = '',
  min_price = '',
  max_price = '',
  is_verified = '',
  is_renting = '',
  is_blank = '',
  lat = null,
  lon = null,
  sort_by = '',
  page = 1,
  page_size = 10,
  max_people = 1,
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
      if (is_verified !== '') params.push(`is_verified=${is_verified}`);
      if (is_renting !== '') params.push(`is_renting=${is_renting}`);
      if (is_blank !== '') params.push(`is_blank=${is_blank}`);
      if (max_people) params.push(`max_people=${max_people}`);
      if (lat && lon) {
        params.push(`lat=${lat}`);
        params.push(`lon=${lon}`);
      }
      if (sort_by) params.push(`sort_by=${encodeURIComponent(sort_by)}`);
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

// Tìm kiếm nhà theo bản đồ (giới hạn 20 nhà gần nhất) với timeout protection
export const getHousesByMapService = async ({
  query = '', // Từ khóa tìm kiếm
  lat, 
  lon, 
  type = '',
  min_price = '',
  max_price = '',
  is_verified = true, 
  is_renting = true, 
  is_blank = '',
  limit = 20, 
} = {}) => {
  try {
    if (!lat || !lon) {
      throw new Error('Cần cung cấp tọa độ (lat, lon)');
    }

    const params = [
      `lat=${lat}`,
      `lon=${lon}`,
    ];
    if (query) params.push(`search=${encodeURIComponent(query)}`);
    if (type) params.push(`type=${encodeURIComponent(type)}`);
    if (min_price) params.push(`min_price=${encodeURIComponent(min_price)}`);
    if (max_price) params.push(`max_price=${encodeURIComponent(max_price)}`);
    if (is_verified !== '') params.push(`is_verified=${is_verified}`);
    if (is_renting !== '') params.push(`is_renting=${is_renting}`);
    if (is_blank !== '') params.push(`is_blank=${is_blank}`);

    const url = `/api/houses/?${params.join('&')}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); 
    
    try {
      const response = await apiClient.get(url, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.data;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  } catch (error) {
    console.error('Error fetching houses by map:', error);
    throw error;
  }
}

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