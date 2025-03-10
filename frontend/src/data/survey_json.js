export const json = {
  "completedHtml": "<h3>感谢您完成测验</h3><div class='processing-message'><p>系统正在分析您的答案，请稍候...</p><div class='loading-spinner'></div><p>几秒后将自动跳转到分析页面</p></div><style>.processing-message{text-align:center;margin-top:20px;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#337ab7;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "在汇编语言中，哪个伪指令用于定义段的开始和结束？",
          "isRequired": true,
          "choices": [
            "DB 和 DW",
            "SEGMENT 和 ENDS",
            "ASSUME 和 END",
            "ORG 和 EQU"
          ],
          "correctAnswer": "SEGMENT 和 ENDS"
        },
        {
          "type": "text",
          "name": "question2",
          "title": "在汇编语言的 INT 21H 中，使用哪个功能号来结束程序？",
          "isRequired": true,
          "correctAnswer": "4CH"
        },
        {
          "type": "radiogroup",
          "name": "question3",
          "title": "在汇编语言中，哪个伪指令用于定义字节类型的数据？",
          "isRequired": true,
          "choices": [
            "DW",
            "DD",
            "DB",
            "EQU"
          ],
          "correctAnswer": "DB"
        },
        {
          "type": "text",
          "name": "question4",
          "title": "汇编语言中，哪个伪指令用于定义常量？",
          "isRequired": true,
          "correctAnswer": "EQU"
        },
        {
          "type": "radiogroup",
          "name": "question5",
          "title": "执行 `MOV AH, 9` 后，再执行 `INT 21H` 通常会实现什么功能？",
          "isRequired": true,
          "choices": [
            "读取一个字符",
            "显示一个字符",
            "显示一个字符串",
            "结束程序"
          ],
          "correctAnswer": "显示一个字符串"
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