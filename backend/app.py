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

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

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
        
        # 更新前端文件
        update_survey_json(quiz_json)
        
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"生成测验失败: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze-quiz', methods=['POST'])
@with_retry(max_retries=3, backoff_factor=0.5)
def analyze_quiz():
    try:
        # 获取用户答案
        data = request.json
        if not data or 'answers' not in data:
            return jsonify({"error": "没有提供答案"}), 400
            
        result = analyze_quiz_results(data['answers'])
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"测验分析错误: {str(e)}")
        return jsonify({"error": f"测验分析失败: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)