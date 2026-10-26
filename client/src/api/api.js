const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('cafe_auth_token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.errors = data.errors;
      err.status = res.status;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}

// Menu Endpoints
export const getMenuItems = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.available !== undefined) query.append('available', params.available);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/menu${qs}`);
};

export const getMenuItemById = async (id) => {
  return request(`/menu/${id}`);
};

export const getCategories = async () => {
  return request('/menu/categories');
};

export const createMenuItem = async (menuData) => {
  return request('/menu', {
    method: 'POST',
    body: JSON.stringify(menuData),
  });
};

export const updateMenuItem = async (id, menuData) => {
  return request(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(menuData),
  });
};

export const deleteMenuItem = async (id) => {
  return request(`/menu/${id}`, {
    method: 'DELETE',
  });
};

// Admin Category Management Endpoints
export const getCategoriesList = async () => {
  return request('/categories');
};

export const createCategory = async (name) => {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const deleteCategoryById = async (id) => {
  return request(`/categories/${id}`, {
    method: 'DELETE',
  });
};

// Order Endpoints
export const placeOrder = async (orderData) => {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const getOrders = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.email) query.append('email', params.email);
  if (params.phone) query.append('phone', params.phone);
  if (params.ids) query.append('ids', params.ids);
  if (params.search) query.append('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/orders${qs}`);
};

export const getOrderById = async (id) => {
  return request(`/orders/${id}`);
};

export const updateOrderStatus = async (id, status) => {
  return request(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const updateOrder = async (id, orderData) => {
  return request(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  });
};

export const deleteOrder = async (id) => {
  return request(`/orders/${id}`, {
    method: 'DELETE',
  });
};

// Auth Endpoints
export const loginUser = async (credentials) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const registerUser = async (userData) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const getCurrentUser = async () => {
  return request('/auth/me');
};
