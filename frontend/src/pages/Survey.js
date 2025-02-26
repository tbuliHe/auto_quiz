import React from "react";
import { Model, StylesManager } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.css";
import { useHistory } from "react-router-dom"; // 修改为 useHistory

import { json } from "../data/survey_json.js";

StylesManager.applyTheme("defaultV2");

function onValueChanged(_, options) {
  console.log("New value: " + options.value);
}

export function SurveyPage() {
  const history = useHistory(); // 使用历史钩子代替导航钩子
  
  async function onComplete(survey) {
    console.log("Survey complete! Results: " + JSON.stringify(survey.data));
    
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let success = false;
    
    while (retryCount < MAX_RETRIES && !success) {
      try {
        // 显示重试信息（如果不是第一次尝试）
        if (retryCount > 0) {
          console.log(`提交答案重试第 ${retryCount} 次...`);
          // 使用我们在EXAMPLE_JSON中定义的全局函数
          if (window.setRetryStatus) {
            window.setRetryStatus(retryCount);
          }
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
        
        // 更新状态显示
        const statusElem = document.getElementById('submit-status');
        if (statusElem) {
          statusElem.textContent = "提交成功! 即将跳转...";
          statusElem.style.color = "#28a745";
        }
        
        // 延迟跳转，给用户足够时间阅读完成信息
        setTimeout(() => {
          // 跳转到分析页面
          history.push('/analytics');
        }, 3000); // 3秒后跳转
        
      } catch (error) {
        retryCount++;
        console.error(`提交答案失败 (尝试 ${retryCount}/${MAX_RETRIES}):`, error);
        
        if (retryCount >= MAX_RETRIES) {
          console.error("已达到最大重试次数");
          
          // 使用我们在EXAMPLE_JSON中定义的全局函数显示错误
          if (window.setSubmitError) {
            window.setSubmitError();
          } else {
            alert(`提交答案失败，已尝试 ${MAX_RETRIES} 次。请检查网络连接或稍后再试。`);
          }
        } else {
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // 随着重试次数增加等待时间
        }
      }
    }
  }

  const model = new Model(json);
  return (
    <div className="container">
      <h1>Quiz</h1>
      <Survey
        model={model}
        onComplete={onComplete}
        onValueChanged={onValueChanged}
      />
    </div>
  );
}
