export const json = {
  "completedHtml": "<h3>感谢您完成测验</h3>",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "以下哪一项是计算机视觉的常见应用？",
          "isRequired": true,
          "choices": [
            "图像分类",
            "网页设计",
            "数据库管理",
            "编写操作系统"
          ],
          "correctAnswer": "图像分类"
        },
        {
          "type": "radiogroup",
          "name": "question2",
          "title": "在图像处理中，哪个操作用于改变图像的亮度或对比度？",
          "isRequired": true,
          "choices": [
            "线性滤波",
            "点操作",
            "傅里叶变换",
            "边缘检测"
          ],
          "correctAnswer": "点操作"
        },
        {
          "type": "radiogroup",
          "name": "question3",
          "title": "以下哪个概念与从多个图像中恢复3D结构有关？",
          "isRequired": true,
          "choices": [
            "图像增强",
            "运动结构恢复 (Structure from Motion)",
            "图像压缩",
            "图像锐化"
          ],
          "correctAnswer": "运动结构恢复 (Structure from Motion)"
        },
        {
          "type": "radiogroup",
          "name": "question4",
          "title": "以下哪一项技术用于在图像中定位特定对象？",
          "isRequired": true,
          "choices": [
            "图像分割",
            "对象检测",
            "图像拼接",
            "图像校正"
          ],
          "correctAnswer": "对象检测"
        },
        {
          "type": "radiogroup",
          "name": "question5",
          "title": "图像对齐和拼接通常用于创建什么？",
          "isRequired": true,
          "choices": [
            "单张低分辨率图像",
            "全景图像",
            "黑白图像",
            "模糊图像"
          ],
          "correctAnswer": "全景图像"
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