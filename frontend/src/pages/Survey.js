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
    
    try {
      // 发送答案到后端进行分析
      const response = await fetch('http://localhost:5000/analyze-quiz', {  // 修改为你的后端实际地址和端口
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: survey.data }),
      });
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      // 存储分析结果供分析页面使用
      sessionStorage.setItem('quizAnalysis', JSON.stringify(result));
      
      // 跳转到分析页面
      history.push('/analytics'); // 使用 history.push 代替 navigate
    } catch (error) {
      console.error("提交答案失败:", error);
      alert("提交答案失败，请重试");
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
