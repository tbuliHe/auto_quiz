export const json = {
  "completedHtml": "<h3>感谢您完成测验</h3><div class='processing-message'><p>系统正在分析您的答案，请稍候...</p><div class='loading-spinner'></div><p>几秒后将自动跳转到分析页面</p></div><style>.processing-message{text-align:center;margin-top:20px;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#337ab7;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "以下哪种几何变换能够保持物体的“平直性”，即变换后平行的两条线依然平行？",
          "isRequired": true,
          "choices": [
            "刚体变换",
            "相似变换",
            "仿射变换",
            "投影变换"
          ],
          "correctAnswer": "仿射变换"
        },
        {
          "type": "text",
          "name": "question2",
          "title": "在估计单应性变换矩阵的传统方法中，通常使用 ______ 算法来剔除错误匹配的特征点对。",
          "isRequired": true,
          "correctAnswer": "RANSAC"
        },
        {
          "type": "radiogroup",
          "name": "question3",
          "title": "图像滤波和图像形变的主要区别是什么？",
          "isRequired": true,
          "choices": [
            "图像滤波改变图像的空间坐标，图像形变改变图像的像素取值。",
            "图像滤波和图像形变都改变图像的空间坐标。",
            "图像滤波改变图像的像素取值，图像形变改变图像的空间坐标。",
            "图像滤波和图像形变都改变图像的像素取值。"
          ],
          "correctAnswer": "图像滤波改变图像的像素取值，图像形变改变图像的空间坐标。"
        },
        {
          "type": "text",
          "name": "question4",
          "title": "使用相机从不同位置拍摄同一平面物体的图像之间存在 _________，可以用投影变换表示（假设无镜头畸变）。",
          "isRequired": true,
          "correctAnswer": "单应性"
        },
        {
          "type": "radiogroup",
          "name": "question5",
          "title": "在几何形变的实现中，哪种变形方式可以避免产生空洞或波纹问题？",
          "isRequired": true,
          "choices": [
            "正向变形",
            "反向变形",
            "两者都会产生",
            "两者都不会产生"
          ],
          "correctAnswer": "反向变形"
        }
      ]
    }
  ],
  "showQuestionNumbers": "on",
  "completedHtmlOnCondition": [
    {
      "expression": "{correctCount} == {questionCount}",
      "html": "<h3>恭喜您全部答对！</h3><div class='processing-message success-message'><p>系统正在生成详细分析报告，请稍候...</p><div class='loading-spinner'></div><p>几秒后将自动跳转到分析页面</p></div><style>.processing-message{text-align:center;margin-top:20px;}.success-message{color:#28a745;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#28a745;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>"
    },
    {
      "expression": "{correctCount} >= {questionCount}/2",
      "html": "<h3>答对了一半以上，继续加油！</h3><div class='processing-message warning-message'><p>系统正在分析您的优势和不足，请稍候...</p><div class='loading-spinner'></div><p>几秒后将自动跳转到分析页面</p></div><style>.processing-message{text-align:center;margin-top:20px;}.warning-message{color:#ffc107;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#ffc107;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>"
    },
    {
      "expression": "{correctCount} < {questionCount}/2",
      "html": "<h3>答对题目较少，请继续学习。</h3><div class='processing-message danger-message'><p>系统正在生成针对性学习建议，请稍候...</p><div class='loading-spinner'></div><p>几秒后将自动跳转到分析页面</p></div><style>.processing-message{text-align:center;margin-top:20px;}.danger-message{color:#dc3545;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#dc3545;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>"
    }
  ]
};