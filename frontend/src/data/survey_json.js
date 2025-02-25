export const json = {
  "completedHtml": "<h3>感谢您完成测验</h3>",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "序列 {0，1，8，27，…，3n…} 的母函数是什么？",
          "isRequired": true,
          "choices": [
            "6x^2 - 20x + 16 / (1-x)^4",
            "6x^2 + 20x - 16 / (1-x)^4",
            "6x^2 - 20x + 16 / (1+x)^4",
            "6x^2 + 20x - 16 / (1+x)^4"
          ],
          "correctAnswer": "6x^2 - 20x + 16 / (1-x)^4"
        },
        {
          "type": "radiogroup",
          "name": "question2",
          "title": "已知序列 {C(n+3, 3), n=0,1,2...}，其母函数为？",
          "isRequired": true,
          "choices": [
            "1 / (1+x)^4",
            "1 / (1-x)^4",
            "1 / (1+x)^3",
            "1 / (1-x)^3"
          ],
          "correctAnswer": "1 / (1-x)^4"
        },
        {
          "type": "radiogroup",
          "name": "question3",
          "title": "已知母函数 G(x) = (783 - 54x + 25x^2) / (1-9x)(1+6x), 求序列 {a_n} 的通项公式。",
          "isRequired": true,
          "choices": [
            "a_n = 7 * 9^n + 4 * (-6)^n",
            "a_n = 7 * 9^n - 4 * (-6)^n",
            "a_n = 7 * (-9)^n + 4 * 6^n",
            "a_n = 7 * (-9)^n - 4 * 6^n"
          ],
          "correctAnswer": "a_n = 7 * 9^n - 4 * (-6)^n"
        },
        {
          "type": "radiogroup",
          "name": "question4",
          "title": "已知母函数 G(x) = (9 - 3x - x^2) / (1-5x-6x^2)，求对应的序列 {a_n} 的通项公式。",
          "isRequired": true,
          "choices": [
            "a_n = 2 * 7^n - 8^n",
            "a_n = 2 * 7^n + 8^n",
            "a_n = 2 * (-7)^n - 8^n",
            "a_n = 2 * (-7)^n + 8^n"
          ],
          "correctAnswer": "a_n = 2 * 7^n + 8^n"
        },
        {
          "type": "radiogroup",
          "name": "question5",
          "title": "如果G_n满足 0 = G_(n+2) - 3G_(n+1) - G_n，G_0 = 0, G_1 = 2，那么序列 {G_n} 的母函数是？",
          "isRequired": true,
          "choices": [
            "(3x-1) / (3 - 5√5/10 - x)(3 + 5√5/10 -x)",
            "(3x-1) / (3 + 5√5/10 - x)(3 + 5√5/10 -x)",
            "(3x+1) / (3 - 5√5/10 - x)(3 + 5√5/10 -x)",
            "(2x) / ((2 - (3+√5)/2 x) (2- (3-√5)/2 x))"
          ],
          "correctAnswer": "(2x) / ((2 - (3+√5)/2 x) (2- (3-√5)/2 x))"
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