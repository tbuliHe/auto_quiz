import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress, 
  Tabs, 
  Tab,
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';

export function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const history = useHistory();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取课程信息
        const coursesResponse = await fetch('http://localhost:5000/api/teacher/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!coursesResponse.ok) {
          throw new Error('获取课程信息失败');
        }
        const coursesData = await coursesResponse.json();
        
        // 获取已布置的测验
        const quizzesResponse = await fetch('http://localhost:5000/api/teacher/assigned-quizzes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!quizzesResponse.ok) {
          throw new Error('获取测验信息失败');
        }
        const quizzesData = await quizzesResponse.json();
        
        setCourses(coursesData);
        setAssignedQuizzes(quizzesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleCreateQuiz = () => {
    history.push('/');  // 跳转到首页创建测验
  };
  
  const handleViewStudentDetails = (courseId, studentId) => {
    history.push(`/teacher/student/${courseId}/${studentId}`);
  };
  
  const handleViewQuizDetails = (quizId) => {
    history.push(`/survey/${quizId}`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>正在加载教师面板...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          重试
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        教师控制面板
      </Typography>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="teacher dashboard tabs">
            <Tab icon={<SchoolIcon />} label="我的课程" id="tab-0" />
            <Tab icon={<QuizIcon />} label="我的测验" id="tab-1" />
            <Tab icon={<AssessmentIcon />} label="成绩统计" id="tab-2" />
          </Tabs>
        </Box>
        
        {/* 我的课程标签页 */}
        <div role="tabpanel" hidden={activeTab !== 0}>
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">教授的课程</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleCreateQuiz}
                >
                  创建新测验
                </Button>
              </Box>
              
              {courses.length === 0 ? (
                <Alert severity="info">
                  您当前没有教授的课程。
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {courses.map(course => (
                    <Grid item xs={12} md={6} lg={4} key={course.id}>
                      <Card elevation={3}>
                        <CardContent>
                          <Typography variant="h6" component="div">
                            {course.name}
                          </Typography>
                          <Typography color="text.secondary" gutterBottom>
                            课程编号: {course.id}
                          </Typography>
                          <Typography sx={{ mb: 1.5 }}>
                            学生人数: {course.studentCount}
                          </Typography>
                          
                          {course.students.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                学生列表:
                              </Typography>
                              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                {course.students.map(student => (
                                  <ListItem 
                                    key={student.id}
                                    secondaryAction={
                                      <Button
                                        size="small"
                                        onClick={() => handleViewStudentDetails(course.id, student.id)}
                                      >
                                        查看
                                      </Button>
                                    }
                                  >
                                    <ListItemText 
                                      primary={`${student.name} (${student.id})`}
                                      secondary={`${student.college} - ${student.major}`}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            onClick={() => history.push(`/teacher/course/${course.id}`)}
                          >
                            课程详情
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </div>
        
        {/* 我的测验标签页 */}
        <div role="tabpanel" hidden={activeTab !== 1}>
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>已布置的测验</Typography>
              
              {assignedQuizzes.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  您还没有布置任何测验。点击"创建新测验"按钮开始布置测验。
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {assignedQuizzes.map((item) => (
                    <Grid item xs={12} md={6} key={`${item.courseId}-${item.chapterId}`}>
                      <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {item.courseName} - {item.chapterName}
                        </Typography>
                        
                        <Typography color="text.secondary" gutterBottom>
                          课程编号: {item.courseId}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="subtitle2" gutterBottom>
                          测验列表:
                        </Typography>
                        
                        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                          {item.quizzes.map((quiz) => (
                            <ListItem 
                              key={quiz.id}
                              secondaryAction={
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleViewQuizDetails(quiz.id)}
                                >
                                  查看测验
                                </Button>
                              }
                            >
                              <ListItemText 
                                primary={quiz.title} 
                                secondary={`${quiz.question_count}题 - ${quiz.difficulty}难度 - ${new Date(quiz.created_at).toLocaleString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </div>
        
        {/* 成绩统计标签页 */}
        <div role="tabpanel" hidden={activeTab !== 2}>
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>课程成绩统计</Typography>
              
              {courses.length === 0 ? (
                <Alert severity="info">
                  您当前没有教授的课程。
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {courses.map(course => (
                    <Grid item xs={12} md={6} key={course.id}>
                      <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {course.name}
                        </Typography>
                        
                        <Typography color="text.secondary" gutterBottom>
                          课程编号: {course.id}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Typography>学生数量: {course.studentCount}</Typography>
                          <Chip 
                            label={`平均分: ${calculateAverageScore(course)}`} 
                            color={getColorByScore(calculateAverageScore(course))}
                          />
                        </Box>
                        
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          sx={{ mt: 2 }}
                          onClick={() => history.push(`/teacher/course-stats/${course.id}`)}
                        >
                          查看详细统计
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </div>
      </Box>
    </Box>
  );
}

// 辅助函数 - 计算平均分
function calculateAverageScore(course) {
  // 此处应与后端API数据结构匹配
  // 简化版本，实际应用中应从API获取
  return Math.round(70 + Math.random() * 20);
}

// 辅助函数 - 根据分数获取颜色
function getColorByScore(score) {
  if (score >= 90) return 'success';
  if (score >= 80) return 'primary';
  if (score >= 70) return 'info';
  if (score >= 60) return 'warning';
  return 'error';
}