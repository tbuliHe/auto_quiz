import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import SurveyAnalytics from "../components/SurveyAnalytics";

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
    return <div className="container loading">正在加载分析结果...</div>;
  }

  if (error) {
    return <div className="container error-message">{error}</div>;
  }

  return (
    <div className="container analytics-container">
      <h2>测验结果与分析</h2>
      
      {/* 测验总结 */}
      <div className="summary-section">
        <h3>测验总结</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">总题数:</span>
            <span className="stat-value">{analysisData.totalQuestions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">正确答案:</span>
            <span className="stat-value">{analysisData.correctCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">错误答案:</span>
            <span className="stat-value">{analysisData.incorrectCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">得分:</span>
            <span className="stat-value">
              {Math.round((analysisData.correctCount / analysisData.totalQuestions) * 100)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* 错误题目 */}
      <div className="incorrect-questions">
        <h3>错误题目</h3>
        {analysisData.incorrectQuestions && analysisData.incorrectQuestions.length > 0 ? (
          analysisData.incorrectQuestions.map((item, index) => (
            <div key={index} className="question-card">
              <h4>问题 {index + 1}: {item.question}</h4>
              <p><strong>你的答案:</strong> {item.userAnswer}</p>
              <p><strong>正确答案:</strong> {item.correctAnswer}</p>
              <div className="options">
                <strong>选项:</strong>
                <ul>
                  {item.options && item.options.map((option, idx) => (
                    <li key={idx} className={option === item.correctAnswer ? "correct-option" : ""}>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p>你回答了所有问题正确！</p>
        )}
      </div>
      
      {/* 知识点分析 */}
      <div className="knowledge-analysis">
        <h3>知识点分析</h3>
        <div className="analysis-content">
          <ReactMarkdown>{analysisData.knowledgeAnalysis}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
