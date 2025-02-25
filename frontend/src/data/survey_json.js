export const json = {
  "completedHtml": "<h3>感谢您完成测验</h3>",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "以下哪一项是代数运算的基本概念？",
          "isRequired": true,
          "choices": [
            "引言",
            "微积分",
            "统计学",
            "几何学"
          ],
          "correctAnswer": "引言"
        },
        {
          "type": "radiogroup",
          "name": "question2",
          "title": "半群是指满足哪种性质的代数结构？",
          "isRequired": true,
          "choices": [
            "交换律",
            "结合律",
            "分配律",
            "逆元存在"
          ],
          "correctAnswer": "结合律"
        },
        {
          "type": "radiogroup",
          "name": "question3",
          "title": "幺半群是在半群的基础上增加了什么性质？",
          "isRequired": true,
          "choices": [
            "存在单位元",
            "存在逆元",
            "满足交换律",
            "满足分配律"
          ],
          "correctAnswer": "存在单位元"
        },
        {
          "type": "radiogroup",
          "name": "question4",
          "title": "以下哪个是典型群的例子？",
          "isRequired": true,
          "choices": [
            "有理数群",
            "循环群",
            "实数群",
            "复数群"
          ],
          "correctAnswer": "循环群"
        },
        {
          "type": "radiogroup",
          "name": "question5",
          "title": "群论在密码学上的一个主要应用是什么？",
          "isRequired": true,
          "choices": [
            "数据压缩",
            "图像处理",
            "加密算法",
            "语音识别"
          ],
          "correctAnswer": "加密算法"
        }
      ]
    }
  ],
  "showQuestionNumbers": "on",
  "completedHtmlOnCondition": [
    {
      "expression": "{correctCount} == {questionCount}",
      "html": "<h3>恭喜您全部答对！</h3>"
    },
    {
      "expression": "{correctCount} >= {questionCount}/2",
      "html": "<h3>答对了一半以上，继续加油！</h3>"
    },
    {
      "expression": "{correctCount} < {questionCount}/2",
      "html": "<h3>答对题目较少，请继续学习。</h3>"
    }
  ]
};