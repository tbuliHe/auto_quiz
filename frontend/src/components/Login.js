import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { login } from '../services/authService';

export function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();

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
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      setLoading(false);
      
      // 根据用户类型重定向到不同页面
      if (formData.userType === 'teacher') {
        history.push('/admin/dashboard');
      } else {
        history.push('/dashboard');
      }
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || '登录失败，请检查用户名和密码');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          用户登录
        </Typography>
        
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
            <Button
              variant="text"
              onClick={() => history.push('/register')}
            >
              没有账号？立即注册
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}