import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 创建一个带有基础URL和超时设置的axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
});

// 添加请求拦截器，可以在此处添加认证令牌等
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

// 添加响应拦截器，统一处理错误等
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理认证过期等情况
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 测验相关接口
export const generateQuiz = async (formData) => {
  try {
    const response = await api.post('/generate-quiz', formData);
    return response.data;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

export const getQuizzes = async () => {
  try {
    const response = await api.get('/quizzes');
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

export const getQuizById = async (quizId) => {
  try {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quiz ${quizId}:`, error);
    throw error;
  }
};

// 分析相关接口
export const analyzeQuiz = async (answers, quizId) => {
  try {
    const response = await api.post('/analyze-quiz', { answers, quiz_id: quizId });
    return response.data;
  } catch (error) {
    console.error('Error analyzing quiz:', error);
    throw error;
  }
};

export const getAnalyses = async () => {
  try {
    const response = await api.get('/analyses');
    return response.data;
  } catch (error) {
    console.error('Error fetching analyses:', error);
    throw error;
  }
};

export const getAnalysisById = async (analysisId) => {
  try {
    const response = await api.get(`/analyses/${analysisId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching analysis ${analysisId}:`, error);
    throw error;
  }
};

// PDF预览相关接口
export const getPdfPreview = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/pdf-preview', formData);
    return response.data;
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    throw error;
  }
};

// 导出所有函数
export default {
  generateQuiz,
  getQuizzes,
  getQuizById,
  analyzeQuiz,
  getAnalyses,
  getAnalysisById,
  getPdfPreview
};