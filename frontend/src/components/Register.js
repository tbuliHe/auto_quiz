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
import { register } from '../services/authService';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    identity: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除对应字段的错误
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.username || formData.username.length < 3 || formData.username.length > 20) {
      errors.username = '用户名长度必须在3-20个字符之间';
    }
    
    if (!formData.password || formData.password.length < 6 || formData.password.length > 20) {
      errors.password = '密码长度必须在6-20个字符之间';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次密码输入不一致';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await register({
        username: formData.username,
        password: formData.password,
        identity: formData.identity
      });
      setLoading(false);
      history.push('/login');
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || '注册失败，请稍后再试');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          用户注册
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="identity-label">注册身份</InputLabel>
            <Select
              labelId="identity-label"
              id="identity"
              name="identity"
              value={formData.identity}
              label="注册身份"
              onChange={handleChange}
            >
              <MenuItem value="student">学生</MenuItem>
              <MenuItem value="teacher">老师</MenuItem>
            </Select>
          </FormControl>
          
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
            error={!!fieldErrors.username}
            helperText={fieldErrors.username}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="确认密码"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!fieldErrors.confirmPassword}
            helperText={fieldErrors.confirmPassword}
          />
          
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
            {loading ? <CircularProgress size={24} /> : '注册'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="text"
              onClick={() => history.push('/login')}
            >
              已有账号？立即登录
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}