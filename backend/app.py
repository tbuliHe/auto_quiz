from flask import Flask, request, jsonify, g
from flask_cors import CORS
import logging
import os
import time
from functools import wraps

import config
from quiz_service import generate_quiz, update_survey_json
from file_service import extract_text_from_pdf
from analysis_service import analyze_quiz_results
from db_service import init_database, save_quiz, save_analysis, get_quiz_by_id, get_analysis_by_id, get_all_quizzes, get_all_analyses

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
init_database()  # 初始化数据库

# 初始化配置
config.init_configuration()

def with_retry(max_retries=3, backoff_factor=0.5, errors=(Exception,)):
    """创建一个带有重试功能的装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except errors as e:
                    retries += 1
                    if retries >= max_retries:
                        app.logger.error(f"函数 {func.__name__} 执行失败，已达到最大重试次数: {e}")
                        raise
                    
                    # 指数退避
                    sleep_time = backoff_factor * (2 ** (retries - 1))
                    app.logger.warning(f"函数 {func.__name__} 失败，{retries}/{max_retries}次尝试。等待{sleep_time:.2f}秒后重试: {e}")
                    time.sleep(sleep_time)
        return wrapper
    return decorator

@app.route('/generate-quiz', methods=['POST'])
def create_quiz():
    try:
        # 获取上传的文件
        if 'file' not in request.files:
            return jsonify({"error": "未上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "未选择文件"}), 400
        
        # 获取参数
        question_count = int(request.form.get('questionCount', 10))
        difficulty = request.form.get('difficulty', 'medium')
        
        # 获取题目类型
        include_multiple_choice = request.form.get('includeMultipleChoice', 'true').lower() in ('true', '1', 't')
        include_fill_in_blank = request.form.get('includeFillInBlank', 'false').lower() in ('true', '1', 't')
        
        # 如果两种题型都没选，默认选择选择题
        if not include_multiple_choice and not include_fill_in_blank:
            include_multiple_choice = True
        
        # 获取备注信息（可选）
        notes = request.form.get('notes', '')
        
        # 提取文本
        if file.filename.lower().endswith('.pdf'):
            content = extract_text_from_pdf(file)
        else:
            content = file.read().decode('utf-8')
        
        # 生成测验题目
        quiz_json = generate_quiz(content, question_count, difficulty, 
                                  include_multiple_choice, include_fill_in_blank, notes)
        
        # 更新前端文件（保留原有功能，但不再是主要方式）
        update_survey_json(quiz_json)
        
        # 保存到数据库
        file_name = file.filename
        title = f"{file_name} - {difficulty}难度 ({question_count}题)"
        quiz_id = save_quiz(title, file_name, quiz_json, question_count, difficulty)
        
        return jsonify({"success": True, "quiz_id": quiz_id}), 200
    except Exception as e:
        logger.error(f"生成测验失败: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze-quiz', methods=['POST'])
@with_retry(max_retries=3, backoff_factor=0.5)
def analyze_quiz():
    try:
        # 获取用户答案和测验ID
        data = request.json
        if not data or 'answers' not in data:
            return jsonify({"error": "没有提供答案"}), 400
        
        quiz_id = data.get('quiz_id')
        
        # 分析结果
        if quiz_id:
            # 从数据库获取测验
            quiz = get_quiz_by_id(quiz_id)
            if not quiz:
                return jsonify({"error": "测验不存在"}), 404
            result = analyze_quiz_results(data['answers'], quiz['quiz_json'])
        else:
            # 从本地文件分析（兼容旧版本）
            result = analyze_quiz_results(data['answers'])
        
        # 保存分析结果到数据库
        if quiz_id:
            analysis_id = save_analysis(quiz_id, result)
            result["analysis_id"] = analysis_id
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"测验分析错误: {str(e)}")
        return jsonify({"error": f"测验分析失败: {str(e)}"}), 500

@app.route('/quizzes', methods=['GET'])
def get_quizzes():
    """获取所有测验"""
    try:
        quizzes = get_all_quizzes()
        return jsonify(quizzes), 200
    except Exception as e:
        logger.error(f"获取测验列表失败: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/quizzes/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    """获取指定ID的测验"""
    try:
        quiz = get_quiz_by_id(quiz_id)
        if quiz:
            return jsonify(quiz), 200
        return jsonify({"error": "测验不存在"}), 404
    except Exception as e:
        logger.error(f"获取测验失败: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyses', methods=['GET'])
def get_analyses():
    """获取所有分析结果"""
    try:
        analyses = get_all_analyses()
        return jsonify(analyses), 200
    except Exception as e:
        logger.error(f"获取分析列表失败: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyses/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    """获取指定ID的分析结果"""
    try:
        analysis = get_analysis_by_id(analysis_id)
        if analysis:
            return jsonify(analysis), 200
        return jsonify({"error": "分析结果不存在"}), 404
    except Exception as e:
        logger.error(f"获取分析结果失败: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)