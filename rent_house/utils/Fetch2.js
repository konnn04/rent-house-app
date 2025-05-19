import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/Config";

// Create a class to handle API requests
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // Helper method to get headers with authorization if token exists
  async getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
      'Accept': 'application/json',
    };

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }

    return headers;
  }

  // Helper method to handle response
  async handleResponse(response) {
    // Check if the response is in the 200-299 range
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }

    // Handle error responses
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      throw new Error(response.statusText || 'Network response was not ok');
    }

    // Create a more informative error
    const error = new Error(errorData.detail || errorData.message || 'API Error');
    error.status = response.status;
    error.response = response;
    error.data = errorData;
    throw error;
  }

  // GET request
  async get(endpoint, params = {}) {
    // Convert params object to URL parameters
    const queryParams = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    }

    const queryString = queryParams.toString();
    const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const headers = await this.getHeaders();
    const response = await fetch(url, { method: 'GET', headers });
    
    return this.handleResponse(response);
  }

  // POST request
  async post(endpoint, data = {}, customHeaders = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(
      customHeaders['Content-Type'] || 'application/json'
    );
    
    // Merge custom headers with default headers
    Object.assign(headers, customHeaders);
    
    // Don't stringify if it's FormData (for file uploads)
    const body = data instanceof FormData ? data : JSON.stringify(data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });
    
    return this.handleResponse(response);
  }

  // PUT request
  async put(endpoint, data = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    
    return this.handleResponse(response);
  }

  // PATCH request
  async patch(endpoint, data = {}, customHeaders = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(
      customHeaders['Content-Type'] || 'application/json'
    );
    
    // Merge custom headers with default headers
    Object.assign(headers, customHeaders);
    
    // Don't stringify if it's FormData (for file uploads)
    const body = data instanceof FormData ? data : JSON.stringify(data);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body
    });
    
    return this.handleResponse(response);
  }

  // DELETE request
  async delete(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    return this.handleResponse(response);
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

