import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// 获取学生成绩信息
export const getStudentGrades = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/grades`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    // 如果API不存在，返回模拟数据用于开发
    // 实际应用中应移除此部分
    console.warn('使用模拟成绩数据');
    return {
      grades: [
        { id: 1, courseId: 'CS101', courseName: '计算机导论', teacher: '张教授', credits: 3, score: 85 },
        { id: 2, courseId: 'MATH201', courseName: '高等数学', teacher: '李教授', credits: 4, score: 92 },
        { id: 3, courseId: 'PHY101', courseName: '大学物理', teacher: '王教授', credits: 3, score: 78 },
        { id: 4, courseId: 'ENG201', courseName: '英语写作', teacher: '马教授', credits: 2, score: 88 },
        { id: 5, courseId: 'CS201', courseName: '数据结构', teacher: '陈教授', credits: 4, score: 95 }
      ]
    };
    // throw error; // 正式环境使用这行
  }
};

export default {
  getStudentGrades
};