import React, { Component } from "react";
import { Model } from "survey-core";
import { DataTables } from "survey-analytics/survey.analytics.datatables";
import $ from "jquery";
import "datatables.net/js/jquery.dataTables";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-colreorder/js/dataTables.colReorder";
import "datatables.net-rowgroup/js/dataTables.rowGroup";
import "datatables.net-colreorder-dt/css/colReorder.dataTables.css";
import "survey-analytics/survey.analytics.datatables.css";
import { json } from "../data/survey_json.js";
import ReactMarkdown from 'react-markdown';

export default class SurveyAnalyticsDatatables extends Component {
  constructor(props) {
    super(props);
    this.state = {
      analysisData: null,
      isLoading: true,
      error: null
    };
  }

  componentDidMount() {
    // 从sessionStorage获取分析数据
    try {
      const analysisData = JSON.parse(sessionStorage.getItem('quizAnalysis'));
      if (analysisData) {
        this.setState({ analysisData, isLoading: false });
      } else {
        this.setState({ 
          isLoading: false, 
          error: "未找到测验数据。请先完成一个测验。" 
        });
      }
    } catch (error) {
      this.setState({ 
        isLoading: false, 
        error: "加载分析数据失败。" 
      });
    }
  }

  renderIncorrectQuestions() {
    const { analysisData } = this.state;
    if (!analysisData || !analysisData.incorrectQuestions || analysisData.incorrectQuestions.length === 0) {
      return <p>你回答了所有问题正确！</p>;
    }

    return (
      <div className="incorrect-questions">
        <h3>错误题目</h3>
        {analysisData.incorrectQuestions.map((item, index) => (
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
        ))}
      </div>
    );
  }

  renderSummary() {
    const { analysisData } = this.state;
    if (!analysisData) return null;

    return (
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
    );
  }

  renderKnowledgeAnalysis() {
    const { analysisData } = this.state;
    if (!analysisData || !analysisData.knowledgeAnalysis) return null;

    return (
      <div className="knowledge-analysis">
        <h3>知识点分析</h3>
        <div className="analysis-content">
          <ReactMarkdown>{analysisData.knowledgeAnalysis}</ReactMarkdown>
        </div>
      </div>
    );
  }

  render() {
    const { isLoading, error } = this.state;

    if (isLoading) {
      return <div className="loading">正在加载分析结果...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    return (
      <div className="analytics-container">
        <h2>测验结果与分析</h2>
        
        {this.renderSummary()}
        {this.renderIncorrectQuestions()}
        {this.renderKnowledgeAnalysis()}
      </div>
    );
  }
}
