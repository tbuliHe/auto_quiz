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
def handle_quiz_generation():
    try:
        # 验证请求数据
        if 'file' not in request.files:
            return jsonify({"error": "没有上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "未选择文件"}), 400
            
        if not file.filename.endswith(('.pdf', '.txt')):
            return jsonify({"error": "只支持 PDF 和 TXT 文件"}), 400

        try:
            question_count = int(request.form['questionCount'])
            if not (5 <= question_count <= 20):
                return jsonify({"error": "题目数量必须在5到20之间"}), 400
        except (KeyError, ValueError):
            return jsonify({"error": "无效的题目数量"}), 400
            
        if 'difficulty' not in request.form or request.form['difficulty'] not in ['easy', 'medium', 'hard']:
            return jsonify({"error": "无效的难度等级"}), 400

        # 读取文件内容
        try:
            if file.filename.endswith('.pdf'):
                content = extract_text_from_pdf(file)
            else:
                content = file.read().decode('utf-8')
                
            if not content.strip():
                return jsonify({"error": "文件内容为空"}), 400
        except Exception as e:
            return jsonify({"error": f"文件读取失败: {str(e)}"}), 400

        # 生成测验
        try:
            quiz_json = generate_quiz(content, question_count, request.form['difficulty'])
        except Exception as e:
            logger.error(f"Quiz generation error: {str(e)}")
            return jsonify({"error": f"测验生成失败: {str(e)}"}), 500

        # 更新 JSON 文件
        try:
            update_survey_json(quiz_json)
        except Exception as e:
            return jsonify({"error": f"保存测验失败: {str(e)}"}), 500

        return jsonify({"message": "测验生成成功"}), 200

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"服务器错误: {str(e)}"}), 500

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