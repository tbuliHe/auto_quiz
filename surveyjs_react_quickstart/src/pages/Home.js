// src/pages/Home.js
import React, { useState } from "react";
import axios from "axios";

export function HomePage() {
  const [file, setFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("questionCount", questionCount);
    formData.append("difficulty", difficulty);

    try {
      const response = await axios.post("http://localhost:5000/generate-quiz", formData);
      alert("题目生成成功!");
    } catch (error) {
      console.error("Error details:", error.response?.data);
      const errorMessage = error.response?.data?.error || error.message;
      setError(`生成失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>生成知识测验</h1>
      <div className="col-lg-6 offset-lg-3">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>上传知识库文档 (PDF/TXT)</label>
            <input 
              type="file" 
              className="form-control"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              required 
            />
          </div>
          
          <div className="form-group mb-3">
            <label>题目数量</label>
            <input
              type="number"
              className="form-control"
              min="5"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>难度等级</label>
            <select 
              className="form-control"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>

          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !file}
          >
            {loading ? '生成中...' : '生成测验'}
          </button>
        </form>
      </div>
    </div>
  );
}