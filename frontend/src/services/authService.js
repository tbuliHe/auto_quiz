import axios from 'axios';

// 设置API基础URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 检查用户是否已登录
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!token && !!user;
};

// 获取当前登录用户信息
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse user from localStorage');
    return null;
  }
};

// 获取用户类型（学生或教师）
export const getUserType = () => {
  const user = getCurrentUser();
  return user ? user.user_type : null;
};

// 用户登录
export const login = async (credentials) => {
  try {
    console.log('Login attempt with:', credentials);
    const response = await axios.post(`${API_URL}/login`, credentials);
    console.log('Login response:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// 用户注册
export const register = async (userData) => {
  try {
    console.log('Register attempt with:', userData);
    const response = await axios.post(`${API_URL}/register`, userData);
    console.log('Register response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error;
  }
};

// 用户登出
export const logout = () => {
  console.log('Logging out...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default {
  isAuthenticated,
  getCurrentUser,
  getUserType,
  login,
  register,
  logout
};