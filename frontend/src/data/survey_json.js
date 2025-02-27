export const json = {
  "completedHtml": "<h3>感谢您完成测验</h3><div class='processing-message'><p>系统正在分析您的答案，请稍候...</p><div class='loading-spinner'></div><p>几秒后将自动跳转到分析页面</p></div><style>.processing-message{text-align:center;margin-top:20px;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#337ab7;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "考虑一个具有三个进程（P1、P2 和 P3）的系统，这些进程的 burst time 分别为 8、4 和 9 个时间单位。采用先到先服务（FCFS）调度算法。如果进程到达顺序为 P2、P3、P1，则平均等待时间是多少？",
          "isRequired": true,
          "choices": [
            "9.0",
            "8.0",
            "10.0",
            "11.0"
          ],
          "correctAnswer": "10.0"
        },
        {
          "type": "text",
          "name": "question2",
          "title": "在银行家算法中，假设有5个进程P0到P4和3种资源类型A，B，C。现有如下状态：\nAllocation: \n A B C\n P0 0 1 0\n P1 2 0 0\n P2 3 0 2\n P3 2 1 1\n P4 0 0 2\n\nMax:\n A B C\n P0 7 5 3\n P1 3 2 2\n P2 9 0 2\n P3 2 2 2\n P4 4 3 3\n\nAvailable: \n A B C\n 3 3 2\n\n当前系统状态是否安全？如果安全，给出一个安全序列。请写出其中一个安全序列。（例如：<P0, P1, P2, P3, P4>）",
          "isRequired": true,
          "correctAnswer": "<P1, P3, P0, P2, P4>"
        },
        {
          "type": "radiogroup",
          "name": "question3",
          "title": "以下哪种磁盘调度算法可能会导致饥饿？",
          "isRequired": true,
          "choices": [
            "FCFS (First-Come, First-Served)",
            "SSTF (Shortest Seek Time First)",
            "SCAN",
            "LOOK"
          ],
          "correctAnswer": "SSTF (Shortest Seek Time First)"
        },
        {
          "type": "text",
          "name": "question4",
          "title": "在使用成组链接法的文件系统中，如果一个磁盘块可以存储1023个磁盘块的编号，那么一个空闲块链表的块最多可以表示______个空闲块。",
          "isRequired": true,
          "correctAnswer": "1024"
        },
        {
          "type": "radiogroup",
          "name": "question5",
          "title": "以下哪个选项不是用于解决临界区问题的软件方案？",
          "isRequired": true,
          "choices": [
            "Peterson算法",
            "Dekker算法",
            "Test-and-Set锁",
            "禁用中断"
          ],
          "correctAnswer": "Test-and-Set锁"
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