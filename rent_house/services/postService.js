import { apiClient } from './Api';

export const createPostService = async (postData) => {
  try {
    const response = await apiClient.post('/api/posts/', postData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
  })
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export const interactWithPostService = async (postId, interactionType) => {
  try {
    const response = await apiClient.post(`/api/posts/${postId}/interact/`, {
      type: interactionType
    });
    return response.data;
  } catch (error) {
    console.error(`Error interacting with post ${postId}:`, error);
    throw error;
  }
}

export const getPostDetailsService = async (postId) => {
  try {
    const response = await apiClient.get(`/api/posts/${postId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for post ${postId}:`, error);
    throw error;
  }
}

export const getPostCommentsService = async (postId, parentId = null, page = 1) => {
  try {
    const response = await apiClient.get(`/api/comments/post_comments/`, {
      params: {
        post_id: postId,
        parent_id: parentId,
        page: page
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
}

export const deletePostService = async (postId) => {
  try {
    const response = await apiClient.delete(`/api/posts/${postId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw error;
  }
}

export const createPostCommentService = async (formData) => {
  try {
    const response = await apiClient.post(`/api/comments/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating comment for post ${formData.post_id}:`, error);
    throw error;
  }
}

export const deletePostCommentService = async (commentId) => {
  try {
    const response = await apiClient.delete(`/api/comments/${commentId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
}


export const searchPostsService = async (query, nextUrl = null, type = null) => {
  try {
    let url = nextUrl;
    
    if (!url) {
      url = '/api/posts/';
      const params = new URLSearchParams();
      
      if (query) {
        params.append('search', query);
      }
      
      if (type) {
        params.append('type', type);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};
