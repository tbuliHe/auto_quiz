import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import { getUserProfile, updateUserInfo, changePassword } from '../services/userService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function UserAccountPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const history = useHistory();
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    gender: '男',
    college: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getUserProfile();
        setUserInfo({
          name: data.name || '',
          gender: data.gender || '男',
          college: data.college || '',
        });
        setLoading(false);
      } catch (error) {
        setError('获取用户信息失败');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // 切换标签页时清除消息
    setError(null);
    setSuccess(null);
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserInfo(userInfo);
      setSaving(false);
      setSuccess('个人信息已成功更新');
    } catch (error) {
      setSaving(false);
      setError('更新个人信息失败: ' + (error.response?.data?.message || '请稍后再试'));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await changePassword(passwordData);
      setSaving(false);
      setSuccess('密码已成功更新');
      // 清空密码表单
      setPasswordData({
        currentPassword: '',
        newPassword: '',
      });
    } catch (error) {
      setSaving(false);
      setError('修改密码失败: ' + (error.response?.data?.message || '请稍后再试'));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>正在加载用户信息...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 4 }}>
        账户管理
      </Typography>

      <Paper elevation={3} sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="account tabs">
            <Tab label="个人信息" />
            <Tab label="修改密码" />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <Box component="form" onSubmit={handleUpdateInfo} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="姓名"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="gender-label">性别</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={userInfo.gender}
                    label="性别"
                    onChange={handleInfoChange}
                  >
                    <MenuItem value="男">男</MenuItem>
                    <MenuItem value="女">女</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="学院"
                  name="college"
                  value={userInfo.college}
                  onChange={handleInfoChange}
                />
              </Grid>
            </Grid>
            
            {error && activeTab === 0 && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && activeTab === 0 && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {success}
              </Alert>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ px: 4, py: 1.2 }}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : '保存修改'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <Box component="form" onSubmit={handleChangePassword} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="当前密码"
              type="password"
              id="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="新密码"
              type="password"
              id="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
            
            {error && activeTab === 1 && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && activeTab === 1 && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {success}
              </Alert>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ px: 4, py: 1.2 }}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : '修改密码'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}