import json
import re
import logging
from config import get_model

logger = logging.getLogger(__name__)

def analyze_quiz_results(user_answers):
    """分析测验结果"""
    # 加载测验题目
    try:
        # 读取survey_json.js内容
        with open("../frontend/src/data/survey_json.js", 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 提取JSON部分
        json_match = re.search(r'export const json = (.+?);', content, re.DOTALL)
        if not json_match:
            raise ValueError("解析测验题目失败")
            
        quiz_json = json.loads(json_match.group(1))
    except Exception as e:
        logger.error(f"加载测验题目失败: {str(e)}")
        raise
    
    # 比较答案，找出错误的题目
    incorrect_questions = []
    correct_count = 0
    total_questions = 0
    
    # 假设测验结构有pages和elements
    for page in quiz_json.get('pages', []):
        for question in page.get('elements', []):
            question_id = question.get('name')
            if question_id and question_id in user_answers:
                total_questions += 1
                user_answer = user_answers[question_id]
                correct_answer = question.get('correctAnswer')
                
                if user_answer != correct_answer:
                    incorrect_questions.append({
                        'question': question.get('title'),
                        'userAnswer': user_answer,
                        'correctAnswer': correct_answer,
                        'options': question.get('choices')
                    })
                else:
                    correct_count += 1
    
    # 使用AI分析结果
    knowledge_analysis = generate_analysis(total_questions, correct_count, incorrect_questions)
    
    # 返回结果
    return {
        "totalQuestions": total_questions,
        "correctCount": correct_count,
        "incorrectCount": len(incorrect_questions),
        "incorrectQuestions": incorrect_questions,
        "knowledgeAnalysis": knowledge_analysis
    }

def generate_analysis(total_questions, correct_count, incorrect_questions):
    """生成知识点分析"""
    model = get_model()
    
    # 如果没有错误题目，直接返回成功信息
    if not incorrect_questions:
        return "恭喜！您回答了所有问题正确。"
    
    analysis_prompt = f"""
    基于以下测验结果，分析用户的知识点掌握情况并提供改进建议。

    总题数: {total_questions}
    正确答案: {correct_count}
    错误答案: {len(incorrect_questions)}
    
    以下是用户回答错误的题目:
    {json.dumps(incorrect_questions, ensure_ascii=False, indent=2)}
    
    请提供:
    1. 用户知识点不足的区域总结
    2. 具体的改进建议
    3. 错误答案中发现的任何模式
    
    请使用markdown格式输出你的分析。
    """
    
    try:
        analysis_response = model.generate_content(analysis_prompt)
        logger.info("成功生成知识点分析")
        return analysis_response.text
    except Exception as e:
        logger.error(f"生成分析失败: {str(e)}")
        return f"生成分析失败: {str(e)}"