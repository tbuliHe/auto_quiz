import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getCourseStats } from '../services/teacherService';

export function CourseStatsPage() {
  const { courseId } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const coursesStats = await getCourseStats();
        const course = coursesStats.find(c => c.id === courseId);
        
        if (course) {
          setCourseData(course);
        } else {
          setError('未找到课程统计信息');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('获取课程统计数据失败:', error);
        setError('无法加载统计数据');
        setLoading(false);
      }
    };
    
    fetchCourseStats();
  }, [courseId]);
  
  const handleBack = () => {
    history.push('/teacher/dashboard');
  };
  
  // 获取颜色基于准确率
  const getBarColor = (accuracy) => {
    if (accuracy >= 80) return '#4caf50';
    if (accuracy >= 60) return '#ff9800';
    return '#f44336';
  };
  
  // 计算平均准确率
  const calculateAverageAccuracy = () => {
    if (!courseData?.chapters || courseData.chapters.length === 0) {
      return 0;
    }// filepath: /home/dim/code/auto_quiz/frontend/src/pages/CourseStats.js
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getCourseStats } from '../services/teacherService';

export function CourseStatsPage() {
  const { courseId } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const coursesStats = await getCourseStats();
        const course = coursesStats.find(c => c.id === courseId);
        
        if (course) {
          setCourseData(course);
        } else {
          setError('未找到课程统计信息');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('获取课程统计数据失败:', error);
        setError('无法加载统计数据');
        setLoading(false);
      }
    };
    
    fetchCourseStats();
  }, [courseId]);
  
  const handleBack = () => {
    history.push('/teacher/dashboard');
  };
  
  // 获取颜色基于准确率
  const getBarColor = (accuracy) => {
    if (accuracy >= 80) return '#4caf50';
    if (accuracy >= 60) return '#ff9800';
    return '#f44336';
  };
  
  // 计算平均准确率
// ...existing code...

  // 计算平均准确率
  const calculateAverageAccuracy = () => {
    if (!courseData?.chapters || courseData.chapters.length === 0) {
      return 0;
    }
    
    const totalAccuracy = courseData.chapters.reduce((sum, chapter) => sum + chapter.accuracy, 0);
    return (totalAccuracy / courseData.chapters.length).toFixed(2);
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
        <Typography color="text.primary">答题统计</Typography>
      </Breadcrumbs>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          {courseData?.name} - 答题统计
        </Typography>
        
        <Grid container spacing={3}>
          {/* 统计概览卡片 */}
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  统计概览
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    章节数量
                  </Typography>
                  <Typography variant="h4">
                    {courseData?.chapters?.length || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    平均正确率
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {calculateAverageAccuracy()}%
                  </Typography>
                </Box>
                
                <Box sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    总答题次数
                  </Typography>
                  <Typography variant="h4">
                    {courseData?.chapters?.reduce((sum, chapter) => sum + chapter.totalAttempts, 0) || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* 章节正确率图表 */}
          <Grid item xs={12} sm={8}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  章节正确率
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={courseData?.chapters || []}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="chapterName"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        label={{ 
                          value: '正确率 (%)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="accuracy" name="正确率">
                        {(courseData?.chapters || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* 详细数据表格 */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  详细统计
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                
                {courseData?.chapters?.map((chapter, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {chapter.chapterName}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          答题次数
                        </Typography>
                        <Typography variant="h6">
                          {chapter.totalAttempts}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          正确次数
                        </Typography>
                        <Typography variant="h6">
                          {chapter.totalCorrect}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          正确率
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: getBarColor(chapter.accuracy)
                          }}
                        >
                          {chapter.accuracy}%
                        </Typography>
                      </Grid>
                    </Grid>
                    {index < courseData.chapters.length - 1 && (
                      <Divider sx={{ my: 2 }} />
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}