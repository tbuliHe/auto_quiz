import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getTeacherCourses } from '../services/teacherService';

export function CourseStudentsPage() {
  const { courseId } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courses = await getTeacherCourses();
        const course = courses.find(c => c.id === courseId);
        
        if (course) {
          setCourseData(course);
        } else {
          setError('未找到课程信息');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('获取课程学生失败:', error);
        setError('无法加载学生数据');
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId]);
  
  const handleBack = () => {
    history.push('/teacher/dashboard');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>加载中...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          返回仪表盘
        </Button>
        
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        返回仪表盘
      </Button>
      
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          sx={{ cursor: 'pointer' }}
          onClick={() => history.push('/teacher/dashboard')}
        >
          教师工作台
        </Link>
        <Typography color="text.primary">{courseData?.name || '课程'}</Typography>
        <Typography color="text.primary">学生列表</Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          {courseData?.name} - 学生列表
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          课程编号: {courseId} | 学生数量: {courseData?.students?.length || 0}
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>学号</TableCell>
                <TableCell>姓名</TableCell>
                <TableCell>性别</TableCell>
                <TableCell>学院</TableCell>
                <TableCell>专业</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courseData?.students && courseData.students.length > 0 ? (
                courseData.students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{student.college}</TableCell>
                    <TableCell>{student.major}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    暂无学生选修此课程
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