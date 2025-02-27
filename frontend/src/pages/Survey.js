import React from "react";
import { Model, StylesManager } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.css";
import { useHistory } from "react-router-dom";
import { Box, Typography, Paper, LinearProgress, Snackbar, Alert } from "@mui/material";
import "../styles/survey-mui-integration.css";
import { json } from "../data/survey_json.js";

StylesManager.applyTheme("defaultV2");

function onValueChanged(_, options) {
  console.log("New value: " + options.value);
}

export function SurveyPage() {
  const history = useHistory();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  
  // 模拟进度条动画
  React.useEffect(() => {
    let timer = null;
    
    if (loading && progress < 90) {
      timer = setInterval(() => {
        setProgress((prevProgress) => prevProgress >= 90 ? 90 : prevProgress + 10);
      }, 500);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading, progress]);
  
  async function onComplete(survey) {
    console.log("Survey complete! Results: " + JSON.stringify(survey.data));
    setLoading(true);
    
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let success = false;
    
    while (retryCount < MAX_RETRIES && !success) {
      try {
        // 显示重试信息（如果不是第一次尝试）
        if (retryCount > 0) {
          console.log(`提交答案重试第 ${retryCount} 次...`);
          setError(`提交答案重试第 ${retryCount} 次...`);
        }
        
        // 发送答案到后端进行分析
        const response = await fetch('http://localhost:5000/analyze-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers: survey.data })
        });
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 存储分析结果供分析页面使用
        sessionStorage.setItem('quizAnalysis', JSON.stringify(result));
        
        // 标记成功
        success = true;
        setProgress(100);
        
        // 延迟跳转，给用户足够时间阅读完成信息
        setTimeout(() => {
          // 跳转到分析页面
          history.push('/analytics');
        }, 3000); // 3秒后跳转
        
      } catch (error) {
        retryCount++;
        console.error(`提交答案失败 (尝试 ${retryCount}/${MAX_RETRIES}):`, error);
        setError(`提交答案失败 (尝试 ${retryCount}/${MAX_RETRIES}): ${error.message}`);
        
        if (retryCount >= MAX_RETRIES) {
          console.error("已达到最大重试次数");
          setError(`提交答案失败，已尝试 ${MAX_RETRIES} 次。请检查网络连接或稍后再试。`);
          setLoading(false);
        } else {
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // 随着重试次数增加等待时间
        }
      }
    }
  }

  const handleCloseError = () => {
    setError(null);
  };

  const model = new Model(json);
  model.showCompletedPage = false; // 避免显示默认的完成页面
  
  // 自定义响应式CSS样式
  const surveyContainerStyles = {
    maxWidth: '800px', 
    margin: '0 auto', 
    padding: '20px'
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        知识测验
      </Typography>
      
      {loading && (
        <Paper elevation={3} sx={{ p: 3, mt: 2, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {progress === 100 ? "提交成功！正在准备分析报告..." : "正在提交您的答案..."}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 10, borderRadius: 5, mt: 2, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {progress === 100 ? "几秒后将自动跳转到分析页面" : `处理中 ${progress}%`}
          </Typography>
        </Paper>
      )}
      
      {!loading && (
        <Paper elevation={3} sx={surveyContainerStyles}>
          <Survey
            model={model}
            onComplete={onComplete}
            onValueChanged={onValueChanged}
          />
        </Paper>
      )}
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
