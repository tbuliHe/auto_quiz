import React from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

export function QuizPage() {
  const history = useHistory();
  
  // 重定向到测验列表页面
  React.useEffect(() => {
    // 这是一个临时的重定向，在实际应用中应该替换为正确的逻辑
    const timer = setTimeout(() => {
      history.push('/survey');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [history]);
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ ml: 2 }}>正在加载测验页面...</Typography>
    </Box>
  );
}