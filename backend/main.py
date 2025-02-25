from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai import types
import PyPDF2
import io
import logging
import httpx

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 配置代理
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'  # 根据您的代理设置修改
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'   # 根据您的代理设置修改

# 配置 httpx 客户端超时
timeout = httpx.Timeout(30.0, connect=20.0)
client = httpx.Client(timeout=timeout)

app = Flask(__name__)
CORS(app)
load_dotenv()

try:
    # 配置 Gemini API
    API_KEY = os.getenv('API_KEY')
    MODEL = os.getenv('MODEL')
    EXAMPLE_JSON = os.getenv('EXAMPLE_JSON')
    API_URL = os.getenv('API_URL')
    
    if not all([API_KEY, MODEL, EXAMPLE_JSON, API_URL]):
        raise ValueError("环境变量未正确加载")
    
    # 配置请求头
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY  # 修改这里，使用正确的header格式
    }
    
    # 测试网络连接
    try:
        test_url = f"{API_URL}/models"
        logger.debug(f"正在测试API连接: {test_url}")
        response = client.get(test_url, headers=headers)
        
        if response.status_code == 200:
            logger.info("API 连接测试成功")
            logger.debug(f"API 响应: {response.text}")
        else:
            logger.error(f"API 连接测试失败: HTTP {response.status_code}")
            logger.error(f"响应内容: {response.text}")
            raise ValueError(f"API 连接测试失败: HTTP {response.status_code}")
    except Exception as e:
        logger.error(f"API 连接测试失败: {str(e)}")
        logger.error("请检查网络连接、代理设置和API密钥")
        raise
    
    # 尝试解析 EXAMPLE_JSON
    try:
        example_json = json.loads(EXAMPLE_JSON)
    except json.JSONDecodeError as e:
        logger.error(f"解析 EXAMPLE_JSON 失败: {str(e)}")
        raise
    
    genai.configure(
        api_key=API_KEY,
        transport='rest'  # 使用 REST 传输方式
    )
    
    # 验证模型是否可用
    try:
        model = genai.GenerativeModel(MODEL)
        # 发送一个简单的测试请求
        response = model.generate_content("test")
        logger.info("Gemini API 配置成功")
    except Exception as e:
        logger.error(f"Gemini API 配置失败: {str(e)}")
        raise
    
except Exception as e:
    logger.error(f"初始化失败: {str(e)}", exc_info=True)
    raise

def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def generate_quiz(content, question_count, difficulty):
    example_json = json.loads(os.getenv('EXAMPLE_JSON'))
    
    prompt = f"""
    你是一个专业的考试出题专家。请根据以下内容生成{question_count}道{difficulty}难度的选择题。
    要求：
    1. 每个问题必须有4个选项
    2. 必须指定正确答案
    3. 题目难度要符合{difficulty}级别
    4. 必须严格按照提供的JSON格式生成
    5. 必须确保生成的是合法的JSON格式
    
    参考内容:
    {content[:3000]}
    
    请严格按照以下JSON格式生成（不要添加任何其他文本）:
    {json.dumps(example_json, indent=2, ensure_ascii=False)}
    """

    try:
        response = model.generate_content(prompt)
        print(response)
        response_text = response.text.strip()
        
        # 尝试清理响应文本以获取有效的JSON
        # 找到第一个 { 和最后一个 }
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx >= 0 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            
            # 额外的清理步骤
            json_str = json_str.replace('\n', ' ')  # 移除换行符
            json_str = ' '.join(json_str.split())   # 规范化空白字符
            
            # 尝试解析JSON
            try:
                quiz_json = json.loads(json_str)
                return quiz_json
            except json.JSONDecodeError as je:
                print(f"JSON parsing error: {str(je)}")
                print(f"Attempted to parse: {json_str}")
                raise ValueError(f"生成的内容不是有效的JSON格式: {str(je)}")
        else:
            raise ValueError("响应中未找到有效的JSON格式内容")
            
    except Exception as e:
        print(f"生成测验失败: {str(e)}")
        print(f"原始响应: {response_text}")
        raise ValueError(f"生成测验失败: {str(e)}")

def update_survey_json(quiz_json):
    survey_json_path = "../frontend/src/data/survey_json.js"
    with open(survey_json_path, 'w', encoding='utf-8') as f:
        f.write(f"export const json = {json.dumps(quiz_json, indent=2, ensure_ascii=False)};")

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
            print(f"Quiz generation error: {str(e)}")
            return jsonify({"error": f"测验生成失败: {str(e)}"}), 500

        # 更新 JSON 文件
        try:
            update_survey_json(quiz_json)
        except Exception as e:
            return jsonify({"error": f"保存测验失败: {str(e)}"}), 500

        return jsonify({"message": "测验生成成功"}), 200

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"服务器错误: {str(e)}"}), 500

@app.route('/analyze-quiz', methods=['POST'])
def analyze_quiz():
    try:
        # 获取用户答案
        data = request.json
        if not data or 'answers' not in data:
            return jsonify({"error": "没有提供答案"}), 400
            
        user_answers = data['answers']
        
        # 加载测验题目
        try:
            # 读取survey_json.js内容
            with open("../frontend/src/data/survey_json.js", 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 提取JSON部分
            import re
            json_match = re.search(r'export const json = (.+?);', content, re.DOTALL)
            if not json_match:
                return jsonify({"error": "解析测验题目失败"}), 500
                
            quiz_json = json.loads(json_match.group(1))
        except Exception as e:
            return jsonify({"error": f"加载测验题目失败: {str(e)}"}), 500
        
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
        
        # 使用Gemini API分析知识点不足
        knowledge_analysis = ""
        if incorrect_questions:
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
                knowledge_analysis = analysis_response.text
            except Exception as e:
                knowledge_analysis = f"生成分析失败: {str(e)}"
        else:
            knowledge_analysis = "恭喜！您回答了所有问题正确。"
        
        # 返回结果
        return jsonify({
            "totalQuestions": total_questions,
            "correctCount": correct_count,
            "incorrectCount": len(incorrect_questions),
            "incorrectQuestions": incorrect_questions,
            "knowledgeAnalysis": knowledge_analysis
        }), 200
        
    except Exception as e:
        print(f"测验分析错误: {str(e)}")
        return jsonify({"error": f"测验分析失败: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)