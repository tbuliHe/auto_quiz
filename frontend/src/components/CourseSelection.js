import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { getAvailableCourses, selectCourse, dropCourse, getSelectedCourses } from '../services/courseService';

export function CourseSelectionPage() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [availableData, selectedData] = await Promise.all([
          getAvailableCourses(),
          getSelectedCourses()
        ]);
        setAvailableCourses(availableData);
        setSelectedCourses(selectedData);
        setLoading(false);
      } catch (error) {
        setError('获取课程信息失败');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectCourse = async (e) => {
    e.preventDefault();
    if (!courseId.trim()) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await selectCourse(courseId);
      const [availableData, selectedData] = await Promise.all([
        getAvailableCourses(),
        getSelectedCourses()
      ]);
      setAvailableCourses(availableData);
      setSelectedCourses(selectedData);
      setSuccess(`成功选修课程 ${courseId}`);
      setCourseId('');
      setActionLoading(false);
    } catch (error) {
      setError('选课失败: ' + (error.response?.data?.message || '请检查课程号是否正确'));
      setActionLoading(false);
    }
  };

  const handleDropCourse = async (e) => {
    e.preventDefault();
    if (!courseId.trim()) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await dropCourse(courseId);
      const [availableData, selectedData] = await Promise.all([
        getAvailableCourses(),
        getSelectedCourses()
      ]);
      setAvailableCourses(availableData);
      setSelectedCourses(selectedData);
      setSuccess(`成功退选课程 ${courseId}`);
      setCourseId('');
      setActionLoading(false);
    } catch (error) {
      setError('退课失败: ' + (error.response?.data?.message || '请检查课程号是否正确'));
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>正在加载课程信息...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" align="center" sx={{ mb: 4 }}>
        课程选择
      </Typography>

      <Grid container spacing={3}>
        {/* 选课表单 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              选课
            </Typography>
            <Box component="form" onSubmit={handleSelectCourse}>
              <TextField
                fullWidth
                label="课程号"
                name="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={actionLoading || !courseId.trim()}
              >
                {actionLoading ? <CircularProgress size={24} /> : '选课'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 退课表单 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              退课
            </Typography>
            <Box component="form" onSubmit={handleDropCourse}>
              <TextField
                fullWidth
                label="课程号"
                name="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="error"
                fullWidth
                disabled={actionLoading || !courseId.trim()}
              >
                {actionLoading ? <CircularProgress size={24} /> : '退课'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {success}
        </Alert>
      )}

      {/* 已选课程 */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          已选课程
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>课程号</TableCell>
                <TableCell>课程名称</TableCell>
                <TableCell>教师</TableCell>
                <TableCell>学分</TableCell>
                <TableCell>状态</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCourses.length > 0 ? (
                selectedCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.teacher}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>
                      <Chip label="已选" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    暂无已选课程
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 可选课程 */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          可选课程
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>课程号</TableCell>
                <TableCell>课程名称</TableCell>
                <TableCell>教师</TableCell>
                <TableCell>学分</TableCell>
                <TableCell>剩余名额</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableCourses.length > 0 ? (
                availableCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.teacher}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>{course.availableSlots}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    暂无可选课程
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