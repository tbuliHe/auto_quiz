import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { login, isAuthenticated } from '../services/authService';

export function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();
  const location = useLocation();
  
  // 如果用户已登录，重定向到对应页面
  useEffect(() => {
    if (isAuthenticated()) {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      if (user.user_type === 'teacher') {
        history.push('/teacher/dashboard');
      } else {
        history.push('/student/dashboard');
      }
    }
  }, [history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(formData);
      console.log("Login success:", response);
      setLoading(false);
      
      // 根据用户类型重定向到不同页面
      if (formData.userType === 'teacher') {
        history.push('/teacher/dashboard');
      } else {
        history.push('/student/dashboard');
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error details:", error);
      setError(error.response?.data?.message || '登录失败，请检查用户名和密码');
    }
  };

  // 检查是否有注册成功的消息
  const registerSuccess = location.state?.registerSuccess;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          用户登录
        </Typography>
        
        {registerSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            注册成功！请使用新账号登录
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="用户名"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="userType-label">身份</InputLabel>
            <Select
              labelId="userType-label"
              id="userType"
              name="userType"
              value={formData.userType}
              label="身份"
              onChange={handleChange}
            >
              <MenuItem value="student">学生</MenuItem>
              <MenuItem value="teacher">老师</MenuItem>
            </Select>
          </FormControl>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '登录'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              href="/register"
              variant="body2"
              underline="hover"
            >
              没有账号？立即注册
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}