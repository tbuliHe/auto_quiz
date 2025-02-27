export const json = {
  "completedHtml": "<h3>Thank you for completing the quiz!</h3><div class='processing-message'><p>The system is analyzing your answers, please wait...</p><div class='loading-spinner'></div><p>You will be automatically redirected to the analysis page in a few seconds</p></div><style>.processing-message{text-align:center;margin-top:20px;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#337ab7;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "Which of the following is the most accurate definition of a set in mathematics?",
          "isRequired": true,
          "choices": [
            "A collection of well-defined and distinct objects.",
            "A group of similar elements.",
            "A series of related items.",
            "A list of items."
          ],
          "correctAnswer": "A collection of well-defined and distinct objects."
        },
        {
          "type": "radiogroup",
          "name": "question2",
          "title": "Given sets A = {1, 2, 3} and B = {3, 4, 5}, what is the result of A ∪ B (A union B)?",
          "isRequired": true,
          "choices": [
            "{3}",
            "{1, 2, 3, 4, 5}",
            "{1, 2, 4, 5}",
            "{}"
          ],
          "correctAnswer": "{1, 2, 3, 4, 5}"
        },
        {
          "type": "radiogroup",
          "name": "question3",
          "title": "What is the power set of the set {a, b}?",
          "isRequired": true,
          "choices": [
            "{{}, {a}, {b}, {a, b}}",
            "{a, b}",
            "{{}, {a, b}}",
            "{a, b, {a, b}}"
          ],
          "correctAnswer": "{{}, {a}, {b}, {a, b}}"
        },
        {
          "type": "radiogroup",
          "name": "question4",
          "title": "If A is a subset of B (A ⊆ B), which of the following is always true?",
          "isRequired": true,
          "choices": [
            "A ∩ B = A",
            "A ∪ B = A",
            "A - B = A",
            "B - A = A"
          ],
          "correctAnswer": "A ∩ B = A"
        },
        {
          "type": "radiogroup",
          "name": "question5",
          "title": "Which of the following is an example of constructing a set using set-builder notation?",
          "isRequired": true,
          "choices": [
            "{x | x is an even number and x < 10}",
            "{2, 4, 6, 8}",
            "A = {1, 2, 3}",
            "B = {a, b, c}"
          ],
          "correctAnswer": "{x | x is an even number and x < 10}"
        },
        {
          "type": "radiogroup",
          "name": "question6",
          "title": "What is the cardinality of the power set of a set with n elements?",
          "isRequired": true,
          "choices": [
            "n",
            "2n",
            "n^2",
            "2^n"
          ],
          "correctAnswer": "2^n"
        },
        {
          "type": "radiogroup",
          "name": "question7",
          "title": "Given two sets A and B, what does A - B represent?",
          "isRequired": true,
          "choices": [
            "The elements that are in both A and B.",
            "The elements that are in A but not in B.",
            "The elements that are in B but not in A.",
            "All the elements in A and B."
          ],
          "correctAnswer": "The elements that are in A but not in B."
        },
        {
          "type": "radiogroup",
          "name": "question8",
          "title": "What is the Cartesian product of A = {1, 2} and B = {a, b}?",
          "isRequired": true,
          "choices": [
            "{(1, a), (2, b)}",
            "{(a, 1), (b, 2)}",
            "{(1, a), (1, b), (2, a), (2, b)}",
            "{1, 2, a, b}"
          ],
          "correctAnswer": "{(1, a), (1, b), (2, a), (2, b)}"
        },
        {
          "type": "radiogroup",
          "name": "question9",
          "title": "In set theory, what is the complement of a set A (denoted as A')?",
          "isRequired": true,
          "choices": [
            "The intersection of A with the universal set.",
            "The set of all elements not in A within the universal set.",
            "The empty set.",
            "The union of A with itself."
          ],
          "correctAnswer": "The set of all elements not in A within the universal set."
        },
        {
          "type": "radiogroup",
          "name": "question10",
          "title": "Which of the following statements is TRUE regarding the empty set (∅)?",
          "isRequired": true,
          "choices": [
            "The empty set is a subset of every set.",
            "The empty set contains all elements.",
            "The empty set is not a subset of any set.",
            "The empty set is equal to the universal set."
          ],
          "correctAnswer": "The empty set is a subset of every set."
        }
      ]
    }
  ],
  "showQuestionNumbers": "on",
  "completedHtmlOnCondition": [
    {
      "expression": "{correctCount} == {questionCount}",
      "html": "<h3>Congratulations! You answered all questions correctly!</h3><div class='processing-message success-message'><p>The system is generating a detailed analysis report, please wait...</p><div class='loading-spinner'></div><p>You will be automatically redirected to the analysis page in a few seconds</p></div><style>.processing-message{text-align:center;margin-top:20px;}.success-message{color:#28a745;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#28a745;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>"
    },
    {
      "expression": "{correctCount} >= {questionCount}/2",
      "html": "<h3>You answered more than half correctly, keep it up!</h3><div class='processing-message warning-message'><p>The system is analyzing your strengths and weaknesses, please wait...</p><div class='loading-spinner'></div><p>You will be automatically redirected to the analysis page in a few seconds</p></div><style>.processing-message{text-align:center;margin-top:20px;}.warning-message{color:#ffc107;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#ffc107;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>"
    },
    {
      "expression": "{correctCount} < {questionCount}/2",
      "html": "<h3>You answered few questions correctly, please continue studying.</h3><div class='processing-message danger-message'><p>The system is generating targeted study suggestions, please wait...</p><div class='loading-spinner'></div><p>You will be automatically redirected to the analysis page in a few seconds</p></div><style>.processing-message{text-align:center;margin-top:20px;}.danger-message{color:#dc3545;}.loading-spinner{display:inline-block;width:40px;height:40px;margin:20px auto;border:4px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:#dc3545;animation:spin 1s ease-in-out infinite;}@keyframes spin{to{transform:rotate(360deg);}}</style>"
    }
  ]
};