import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SchoolIcon from '@mui/icons-material/School';

export function AnalyticsPage() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('quizAnalysis');
      console.log("从sessionStorage加载的数据:", storedData);
      
      if (storedData) {
        const data = JSON.parse(storedData);
        setAnalysisData(data);
        setIsLoading(false);
      } else {
        setError('未找到测验数据。请先完成一个测验。');
        setIsLoading(false);
      }
    } catch (error) {
      console.error("解析分析数据时出错:", error);
      setError('加载分析数据失败。');
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>正在加载分析结果...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  // 计算得分百分比
  const scorePercentage = Math.round((analysisData.correctCount / analysisData.totalQuestions) * 100);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 4 }}>
        测验结果与分析
      </Typography>
      
      {/* 测验总结 - 使用卡片网格布局 */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1 }} /> 测验总结
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">总题数</Typography>
                <Typography variant="h4" sx={{ my: 1 }}>{analysisData.totalQuestions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Typography variant="body2">正确答案</Typography>
                <Typography variant="h4" sx={{ my: 1 }}>{analysisData.correctCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', bgcolor: 'error.light', color: 'white' }}>
              <CardContent>
                <Typography variant="body2">错误答案</Typography>
                <Typography variant="h4" sx={{ my: 1 }}>{analysisData.incorrectCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ textAlign: 'center', height: '100%', 
              bgcolor: scorePercentage >= 80 ? 'success.light' : 
                     scorePercentage >= 60 ? 'warning.light' : 'error.light',
              color: 'white' }}>
              <CardContent>
                <Typography variant="body2">得分</Typography>
                <Typography variant="h4" sx={{ my: 1 }}>{scorePercentage}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 错误题目部分 */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ErrorIcon sx={{ mr: 1, color: 'error.main' }} /> 错误题目
        </Typography>
        
        {analysisData.incorrectQuestions && analysisData.incorrectQuestions.length > 0 ? (
          <List>
            {analysisData.incorrectQuestions.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <ListItem alignItems="flex-start" sx={{ 
                  p: 2, 
                  bgcolor: 'error.light', 
                  color: 'white', 
                  borderRadius: '4px 4px 0 0' 
                }}>
                  <ListItemText 
                    primary={`问题 ${index + 1}: ${item.question}`} 
                    primaryTypographyProps={{ fontWeight: 'bold' }} 
                  />
                </ListItem>
                
                <Card variant="outlined" sx={{ borderTop: 0, borderRadius: '0 0 4px 4px', mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" color="error" sx={{ fontWeight: 'medium' }}>
                          你的答案: {item.userAnswer}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" color="success.main" sx={{ fontWeight: 'medium' }}>
                          正确答案: {item.correctAnswer}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>选项:</Typography>
                    <Box sx={{ pl: 2 }}>
                      {item.options && item.options.map((option, idx) => (
                        <Typography key={idx} variant="body2" sx={{ 
                          py: 0.5,
                          color: option === item.correctAnswer ? 'success.main' : 'inherit',
                          fontWeight: option === item.correctAnswer ? 'bold' : 'normal',
                        }}>
                          {option === item.correctAnswer ? (
                            <CheckCircleIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                          ) : null}
                          {option}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />}>
            你回答了所有问题正确！
          </Alert>
        )}
      </Paper>
      
      {/* 知识点分析 */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          知识点分析
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ 
          p: 2, 
          borderRadius: 1,
          bgcolor: 'background.default',
          '& blockquote': {
            borderLeft: '4px solid #1976d2',
            pl: 2,
            py: 1,
            bgcolor: 'rgba(25, 118, 210, 0.1)',
            mx: 0
          },
          '& h1, & h2, & h3': {
            borderBottom: '1px solid #eaecef',
            pb: 1
          },
          '& pre': {
            bgcolor: '#f6f8fa',
            p: 2,
            borderRadius: 1,
            overflowX: 'auto'
          },
          '& a': {
            color: 'primary.main'
          }
        }}>
          <ReactMarkdown>{analysisData.knowledgeAnalysis}</ReactMarkdown>
        </Box>
      </Paper>
    </Box>
  );
}
