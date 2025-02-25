export const json = {
  "completedHtml": "<h3>感谢您完成测验</h3>",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "在 EXT2 文件系统中，如果磁盘块大小为 1KB，指针大小为 4B，一个间接块指针最多能指向多少个数据块？",
          "isRequired": true,
          "choices": [
            "128",
            "256",
            "512",
            "1024"
          ],
          "correctAnswer": "256"
        },
        {
          "type": "radiogroup",
          "name": "question2",
          "title": "下列哪个命令用于修改文件的所有者?",
          "isRequired": true,
          "choices": [
            "chmod",
            "chown",
            "chgrp",
            "ls -l"
          ],
          "correctAnswer": "chown"
        },
        {
          "type": "radiogroup",
          "name": "question3",
          "title": "关于Linux的虚拟内存管理，以下说法正确的是?",
          "isRequired": true,
          "choices": [
            "每个进程都有相同的物理地址空间。",
            "每个进程都有独立的虚拟地址空间，但共享相同的页表。",
            "每个进程都有独立的虚拟地址空间和独立的页表。",
            "虚拟内存的大小受限于物理内存的大小。"
          ],
          "correctAnswer": "每个进程都有独立的虚拟地址空间和独立的页表。"
        },
        {
          "type": "radiogroup",
          "name": "question4",
          "title": "以下哪个进程间通信 (IPC) 机制的效率通常最高？",
          "isRequired": true,
          "choices": [
            "消息队列",
            "管道",
            "共享内存",
            "Socket"
          ],
          "correctAnswer": "共享内存"
        },
        {
          "type": "radiogroup",
          "name": "question5",
          "title": "在 Shell 脚本中，`$?` 特殊变量代表什么含义？",
          "isRequired": true,
          "choices": [
            "脚本的进程 ID",
            "上一个命令的退出状态码",
            "脚本接收到的参数个数",
            "当前 Shell 的版本号"
          ],
          "correctAnswer": "上一个命令的退出状态码"
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