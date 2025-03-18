import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 获取用户可选课程
export const getAvailableCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/courses/available`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取用户已选课程
export const getSelectedCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/courses/selected`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 选课
export const selectCourse = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/courses/select`, { courseId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 退课
export const dropCourse = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/courses/drop`, { courseId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getAvailableCourses,
  getSelectedCourses,
  selectCourse,
  dropCourse
};