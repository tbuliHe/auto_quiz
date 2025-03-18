import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 创建axios实例并添加拦截器
const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 获取教师的课程列表
export const getTeacherCourses = async () => {
  try {
    const response = await api.get('/teacher/courses');
    return response.data;
  } catch (error) {
    console.error('获取课程失败:', error);
    throw error;
  }
};

// 获取教师课程的统计信息
export const getCourseStats = async (courseId) => {
  try {
    const response = await api.get('/teacher/course-stats');
    // 如果没有指定courseId，返回所有课程统计
    if (!courseId) {
      return response.data;
    }
    // 否则返回特定课程的统计
    const course = response.data.find(c => c.id === courseId);
    if (!course) {
      throw new Error('课程不存在');
    }
    return course;
  } catch (error) {
    console.error('获取课程统计失败:', error);
    throw error;
  }
};

// 创建测验并关联到课程
export const createCourseQuiz = async (formData) => {
  try {
    const response = await api.post('/generate-quiz', formData);
    return response.data;
  } catch (error) {
    console.error('创建测验失败:', error);
    throw error;
  }
};

export default {
  getTeacherCourses,
  getCourseStats,
  createCourseQuiz
};