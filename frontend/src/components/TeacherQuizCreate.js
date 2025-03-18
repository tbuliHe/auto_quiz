import React, { useState, useEffect } from 'react';
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import PdfPreview from '../components/PdfPreview';
import { getTeacherCourses } from '../services/teacherService';
import { generateQuiz } from '../services/api';

// 隐藏的文件输入框
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export function TeacherQuizCreatePage() {
  const history = useHistory();
  const [file, setFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [notes, setNotes] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [isPdf, setIsPdf] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // 题目类型状态
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: true,
    fillInBlank: false
  });

  // 获取教师的课程列表
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getTeacherCourses();
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setCourseId(coursesData[0].id);
        }
        setCoursesLoading(false);
      } catch (error) {
        console.error('获取教师课程失败:', error);
        setError('加载课程失败，请稍后再试');
        setCoursesLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleFileUpload = (event) => {
    if (event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileSelected(true);
      setError(null);
      
      // 检查是否为PDF文件
      const isPdfFile = selectedFile.type === 'application/pdf' || 
                       selectedFile.name.toLowerCase().endsWith('.pdf');
      setIsPdf(isPdfFile);
      
      // 如果是PDF文件，显示预览对话框
      if (isPdfFile) {
        setShowPdfPreview(true);
      } else {
        // 如果不是PDF，重置选定页面
        setSelectedPages([]);
      }
    }
  };

  // 处理题目类型变更
  const handleQuestionTypeChange = (event) => {
    const { name, checked } = event.target;
    
    // 至少需要选择一种题型
    if (name === 'multipleChoice' && !checked && !questionTypes.fillInBlank) {
      return; // 不允许取消选择此类型，因为它是最后一个被选择的
    }
    if (name === 'fillInBlank' && !checked && !questionTypes.multipleChoice) {
      return; // 同上
    }
    
    setQuestionTypes({
      ...questionTypes,
      [name]: checked
    });
  };

  // 处理页面选择完成
  const handlePagesSelected = (pages) => {
    setSelectedPages(pages);
    setShowPdfPreview(false);
  };

  // 关闭PDF预览对话框
  const handleClosePdfPreview = () => {
    setShowPdfPreview(false);
    // 如果用户取消了预览而没有选择页面，重置文件选择
    if (selectedPages.length === 0) {
      setFile(null);
      setFileSelected(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseId) {
      setError('请选择要关联的课程');
      return;
    }
    
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("questionCount", questionCount);
    formData.append("difficulty", difficulty);
    formData.append("courseId", courseId);
    
    // 添加题目类型信息
    formData.append("includeMultipleChoice", questionTypes.multipleChoice);
    formData.append("includeFillInBlank", questionTypes.fillInBlank);
    
    // 添加备注信息到表单数据
    if (notes.trim()) {
      formData.append("notes", notes);
    }
    
    // 添加选定页面信息
    if (isPdf && selectedPages.length > 0) {
      formData.append("selectedPages", JSON.stringify(selectedPages));
    }

    try {
      const response = await generateQuiz(formData);
      setLoading(false);
      
      // 显示成功消息
      setSnackbar({
        open: true,
        message: '测验创建成功！',
        severity: 'success'
      });
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        history.push(`/survey/${response.quiz_id}`);
      }, 1500);
    } catch (error) {
      setLoading(false);
      console.error("Error details:", error.response?.data);
      const errorMessage = error.response?.data?.error || error.message;
      setError(`生成失败: ${errorMessage}`);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleBack = () => {
    history.push('/teacher/dashboard');
  };

  return (
    <Box sx={{ my: 4, maxWidth: 1000, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        返回教师控制台
      </Button>
      
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink 
          color="inherit" 
          sx={{ cursor: 'pointer' }}
          onClick={() => history.push('/teacher/dashboard')}
        >
          教师工作台
        </MuiLink>
        <Typography color="text.primary">创建测验</Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        创建课程测验
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              上传学习材料
            </Typography>
            
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ px: 3, py: 1.5 }}
              >
                上传知识库文档 (PDF/TXT)
                <VisuallyHiddenInput type="file" accept=".pdf,.txt" onChange={handleFileUpload} />
              </Button>
              {fileSelected && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    已选择文件: {file?.name}
                  </Typography>
                  {isPdf && selectedPages.length > 0 && (
                    <Typography variant="body2" sx={{ color: 'info.main', mt: 0.5 }}>
                      已选择 {selectedPages.length} 页
                      <Button 
                        size="small" 
                        sx={{ ml: 1 }} 
                        onClick={() => setShowPdfPreview(true)}
                      >
                        重新选择
                      </Button>
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            
            {/* PDF预览对话框 */}
            {showPdfPreview && file && (
              <PdfPreview 
                file={file} 
                onPagesSelected={handlePagesSelected} 
                onClose={handleClosePdfPreview} 
              />
            )}
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="course-label">关联课程</InputLabel>
              <Select
                labelId="course-label"
                id="course"
                value={courseId}
                label="关联课程"
                onChange={(e) => setCourseId(e.target.value)}
              >
                {coursesLoading ? (
                  <MenuItem disabled>加载中...</MenuItem>
                ) : (
                  courses.map(course => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name} ({course.id})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              margin="normal"
              label="备注（可选）"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="可以在这里添加对测验的特殊要求或提示"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              测验配置
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="question-count-label">题目数量</InputLabel>
              <Select
                labelId="question-count-label"
                id="questionCount"
                value={questionCount}
                label="题目数量"
                onChange={(e) => setQuestionCount(e.target.value)}
              >
                <MenuItem value={5}>5 题</MenuItem>
                <MenuItem value={10}>10 题</MenuItem>
                <MenuItem value={15}>15 题</MenuItem>
                <MenuItem value={20}>20 题</MenuItem>
                <MenuItem value={30}>30 题</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="difficulty-label">难度级别</InputLabel>
              <Select
                labelId="difficulty-label"
                id="difficulty"
                value={difficulty}
                label="难度级别"
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <MenuItem value="easy">简单</MenuItem>
                <MenuItem value="medium">中等</MenuItem>
                <MenuItem value="hard">困难</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                题目类型
              </Typography>
              <FormGroup>
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={questionTypes.multipleChoice} 
                      onChange={handleQuestionTypeChange}
                      name="multipleChoice"
                    />
                  }
                  label="选择题"
                />
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={questionTypes.fillInBlank} 
                      onChange={handleQuestionTypeChange}
                      name="fillInBlank"
                    />
                  }
                  label="填空题"
                />
              </FormGroup>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!fileSelected || loading}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : '生成测验'}
          </Button>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}