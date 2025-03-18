import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 获取用户个人信息
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    // 如果API不存在，返回模拟数据用于开发
    console.warn('使用模拟用户数据');
    return {
      name: '张三',
      gender: '男',
      college: '计算机科学与技术学院',
      studentId: '2021001001'
    };
    // throw error; // 正式环境使用这行
  }
};

// 更新用户个人信息
export const updateUserInfo = async (userInfo) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/user/profile`, userInfo, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.warn('模拟更新成功');
    return { success: true };
    // throw error; // 正式环境使用这行
  }
};

// 修改密码
export const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/user/change-password`, passwordData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.warn('模拟密码更新成功');
    return { success: true };
    // throw error; // 正式环境使用这行
  }
};

export default {
  getUserProfile,
  updateUserInfo,
  changePassword
};