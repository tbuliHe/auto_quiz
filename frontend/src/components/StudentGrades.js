// filepath: frontend/src/pages/StudentGrades.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { getStudentGrades } from '../services/gradeService';

export function StudentGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCredits: 0,
    gpa: 0,
    passedCourses: 0,
    totalCourses: 0
  });

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await getStudentGrades();
        setGrades(data.grades);
        
        // 计算统计数据
        let totalCredits = 0;
        let totalGradePoints = 0;
        let passedCourses = 0;
        
        data.grades.forEach(grade => {
          totalCredits += grade.credits;
          // 假设分数是百分制，转换为GPA (4.0制)
          const gradePoint = convertToGradePoint(grade.score);
          totalGradePoints += (gradePoint * grade.credits);
          if (grade.score >= 60) passedCourses++;
        });
        
        const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
        
        setStats({
          totalCredits,
          gpa,
          passedCourses,
          totalCourses: data.grades.length
        });
        
        setLoading(false);
      } catch (error) {
        setError('获取成绩信息失败');
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // 分数转GPA
  const convertToGradePoint = (score) => {
    if (score >= 90) return 4.0;
    if (score >= 85) return 3.7;
    if (score >= 80) return 3.3;
    if (score >= 75) return 3.0;
    if (score >= 70) return 2.7;
    if (score >= 65) return 2.3;
    if (score >= 60) return 2.0;
    return 0;
  };

  // 根据分数返回状态和颜色
  const getGradeStatus = (score) => {
    if (score >= 85) return { label: '优秀', color: 'success' };
    if (score >= 70) return { label: '良好', color: 'info' };
    if (score >= 60) return { label: '及格', color: 'warning' };
    return { label: '不及格', color: 'error' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>正在加载成绩信息...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 4 }}>
        成绩查询
      </Typography>

      {/* 成绩统计概要 */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            flex: '1 1 200px',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>总学分</Typography>
          <Typography variant="h4" color="primary">{stats.totalCredits}</Typography>
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            flex: '1 1 200px',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>GPA</Typography>
          <Typography variant="h4" color="primary">{stats.gpa}</Typography>
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            flex: '1 1 200px',
            borderRadius: 2,
            textAlign: 'center' 
          }}
        >
          <Typography variant="h6" gutterBottom>通过课程</Typography>
          <Typography variant="h4" color="primary">
            {stats.passedCourses}/{stats.totalCourses}
          </Typography>
        </Paper>
      </Box>

      {/* 成绩列表 */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          成绩列表
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>课程号</TableCell>
                <TableCell>课程名称</TableCell>
                <TableCell>教师</TableCell>
                <TableCell>学分</TableCell>
                <TableCell>成绩</TableCell>
                <TableCell>状态</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.length > 0 ? (
                grades.map((grade) => {
                  const status = getGradeStatus(grade.score);
                  return (
                    <TableRow key={grade.id}>
                      <TableCell>{grade.courseId}</TableCell>
                      <TableCell>{grade.courseName}</TableCell>
                      <TableCell>{grade.teacher}</TableCell>
                      <TableCell>{grade.credits}</TableCell>
                      <TableCell>{grade.score}</TableCell>
                      <TableCell>
                        <Chip 
                          label={status.label} 
                          color={status.color} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    暂无成绩记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}