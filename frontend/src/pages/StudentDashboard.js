import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Divider
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import { getStudentGrades } from '../services/gradeService';
import { getSelectedCourses } from '../services/courseService';
import { getStudentAccuracy } from '../services/studentService';

export function StudentDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [accuracy, setAccuracy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();
  
  // 从localStorage获取学生信息
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 并行请求数据
        const [coursesData, gradesData, accuracyData] = await Promise.all([
          getSelectedCourses(),
          getStudentGrades(),
          getStudentAccuracy()
        ]);
        
        setCourses(coursesData);
        setGrades(gradesData.grades || []);
        setAccuracy(accuracyData);
        setLoading(false);
      } catch (err) {
        console.error('获取学生数据失败:', err);
        setError('无法加载数据，请稍后再试');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleTakeQuiz = () => {
    history.push('/survey');  // 跳转到测验列表页面
  };
  
  const handleViewCourses = () => {
    history.push('/course-selection');  // 跳转到课程选择页面
  };
  
  const handleViewGrades = () => {
    history.push('/grades');  // 跳转到成绩页面
  };
  
  // 计算平均准确率
  const calculateAverageAccuracy = () => {
    if (accuracy.length === 0) return 0;
    
    const totalAccuracy = accuracy.reduce((sum, item) => sum + item.accuracy, 0);
    return (totalAccuracy / accuracy.length).toFixed(2);
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
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        学生工作台
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          欢迎，{user?.name || '同学'}
        </Typography>
        <Typography variant="body1" paragraph>
          在这里，您可以参加测验，查看成绩，选择课程，获取学习反馈。
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<QuizIcon />}
            onClick={handleTakeQuiz}
            sx={{ mb: 2 }}
          >
            开始测验
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<SchoolIcon />}
            onClick={handleViewCourses}
            sx={{ mb: 2 }}
          >
            课程选择
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<GradeIcon />}
            onClick={handleViewGrades}
            sx={{ mb: 2 }}
          >
            查看成绩
          </Button>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* 学习数据卡片 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                学习数据
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  已选课程数
                </Typography>
                <Typography variant="h5">
                  {courses.length}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  总学分
                </Typography>
                <Typography variant="h5">
                  {courses.reduce((sum, course) => sum + (course.credits || 0), 0)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  平均准确率
                </Typography>
                <Typography variant="h5">
                  {calculateAverageAccuracy()}%
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(calculateAverageAccuracy())} 
                sx={{ height: 8, borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* 最近成绩卡片 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                成绩概览
              </Typography>
              
              {grades.length > 0 ? (
                <List disablePadding>
                  {grades.slice(0, 5).map((grade) => (
                    <ListItem key={grade.id} disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary={grade.courseName}
                        secondary={`${grade.score}分 | ${grade.credits}学分`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暂无成绩数据
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleViewGrades}>
                查看所有成绩
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* 学习效果卡片 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                学习效果
              </Typography>
              
              {accuracy.length > 0 ? (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    最近章节答题准确率
                  </Typography>
                  
                  <List disablePadding>
                    {accuracy.slice(0, 5).map((item, index) => (
                      <Box key={index} sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.chapterName}</span>
                          <span>{item.accuracy}%</span>
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.accuracy} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 1,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: item.accuracy >= 80 ? 'success.main' : 
                                     item.accuracy >= 60 ? 'warning.main' : 'error.main'
                            }
                          }} 
                        />
                      </Box>
                    ))}
                  </List>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暂无答题数据
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}