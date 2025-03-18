from flask import Flask, request, jsonify, g
from flask_cors import CORS
import logging
import os
import time
from functools import wraps
import json
import jwt as pyjwt
from datetime import datetime, timedelta
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash

import config
from quiz_service import generate_quiz, update_survey_json
from file_service import extract_text_from_pdf, generate_pdf_previews
from analysis_service import analyze_quiz_results
from db_service import init_database, save_quiz, save_analysis, get_quiz_by_id, get_analysis_by_id, get_all_quizzes, get_all_analyses
from db_manager import (
    init_database, save_quiz, save_analysis, get_quiz_by_id, 
    get_analysis_by_id, get_all_quizzes, get_all_analyses,
    execute_query, insert_data, update_data, delete_data_by_id
)
# 确保从backend/manage导入正确的数据库操作函数
import sys
from os.path import dirname, abspath, join
backend_dir = dirname(dirname(abspath(__file__)))
sys.path.append(join(backend_dir, 'manage'))

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

init_database()  # 初始化测验数据库
# 初始化配置
config.init_configuration()

# 添加 JWT 密钥配置
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-for-jwt')
app.config['JWT_EXPIRATION_DELTA'] = timedelta(hours=24)

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

# 认证装饰器
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if (auth_header and auth_header.startswith('Bearer ')):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = pyjwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = {
                'id': data['id'],
                'username': data['username'],
                'user_type': data['user_type']
            }
        except pyjwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# 用户登录接口修改示例
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user_type = data.get('userType', 'student')  # 默认为学生
    
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
    
    # 根据用户类型查询相应的表
    table = 'student' if user_type == 'student' else 'teacher'
    id_field = 'sno' if user_type == 'student' else 'tno'
    
    # 修改为使用execute_query
    result = execute_query(f"SELECT * FROM {table} WHERE {id_field}=?", (username,))
    
    if not result:
        return jsonify({'message': 'User not found'}), 404
    
    # 密码验证
    if result[0]['password'] != password:  # 注意使用字典访问
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # 创建 JWT Token
    token = pyjwt.encode(
        {
            'id': result[0][id_field],
            'username': username,
            'user_type': user_type,
            'exp': datetime.utcnow() + app.config['JWT_EXPIRATION_DELTA']
        },
        app.config['JWT_SECRET_KEY'],
        algorithm="HS256"
    )
    
    # PyJWT 在某些版本中返回字节串，需要解码为字符串
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    
    
    # 返回用户信息和令牌
    user_info = {
        'id': result[0][id_field],
        'username': result[0]['name'],
        'gender': result[0]['gender'],
        'college': result[0]['college'],
        'user_type': user_type  # 添加用户类型
    }
    
    if user_type == 'student':
        user_info['major'] = result[0]['major']
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user_info
    }), 200

# 用户注册接口
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    identity = data.get('identity', 'student')
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
    
    # 确定数据库表和主键字段
    table = 'student' if identity == 'student' else 'teacher'
    column = 'sno' if identity == 'student' else 'tno'
    
    # 检查用户名是否已存在
    result = execute_query(
        f"SELECT * FROM {table} WHERE {column}=?", 
        (username,)
    )
    if result:
        return jsonify({'message': 'Username already exists'}), 409
    
    # 创建用户数据
    user_data = {column: username, 'password': password, 'name': '新用户'}
    
    if identity == 'student':
        user_data.update({
            'gender': '男', 
            'college': '未填写', 
            'major': '未填写'
        })
    else:
        user_data.update({
            'gender': '男', 
            'college': '未填写'
        })
    
    # 插入用户
    insert_data(user_data, table)
    
    return jsonify({
        'message': 'Registration successful',
        'user_id': username,
        'identity': identity
    }), 201

@app.route('/pdf-preview', methods=['POST'])
def preview_pdf():
    try:
        # 获取上传的文件
        if 'file' not in request.files:
            return jsonify({"error": "未上传文件"}), 400
        
        file = request.files['file']
        if file.filename == '' or not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "未选择PDF文件"}), 400
        
        # 生成预览图
        previews = generate_pdf_previews(file)
        
        # 返回预览数据
        return jsonify({
            "success": True, 
            "previews": previews,
            "totalPages": len(previews)
        }), 200
    except Exception as e:
        logger.error(f"生成PDF预览失败: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 修改 generate-quiz 接口，支持直接布置测验到特定课程
@app.route('/generate-quiz', methods=['POST'])
@token_required
def create_quiz(current_user):
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
        
        # 获取选定页面列表
        selected_pages = request.form.get('selectedPages')
        if selected_pages:
            try:
                selected_pages = json.loads(selected_pages)
            except json.JSONDecodeError:
                selected_pages = None
        
        # 提取文本
        if file.filename.lower().endswith('.pdf'):
            content = extract_text_from_pdf(file, selected_pages)
        else:
            content = file.read().decode('utf-8')
        
        # 生成测验题目
        quiz_json = generate_quiz(content, question_count, difficulty, 
                                 include_multiple_choice, include_fill_in_blank, notes)
        
        # 更新前端文件（保留原有功能）
        update_survey_json(quiz_json)
        
        # 保存到数据库
        file_name = file.filename
        title = f"{file_name} - {difficulty}难度 ({question_count}题)"
        quiz_id = save_quiz(title, file_name, quiz_json, question_count, difficulty)
        
        # 如果是教师且指定了课程，则直接布置测验到课程
        course_id = request.form.get('courseId')
        chapter_name = request.form.get('chapterName', '默认章节')
        
        if current_user['user_type'] == 'teacher' and course_id:
            teacher_id = current_user['id']
            
            # 验证课程是否属于该教师
            course_result = execute_query(
                "SELECT * FROM course WHERE cno=? AND tno=?", 
                (course_id, teacher_id)
            )
            
            if course_result:
                # 检查章节是否已存在
                chapter_result = execute_query(
                    "SELECT * FROM question WHERE qname=? AND cno=?",
                    (chapter_name, course_id)
                )
                
                if chapter_result:
                    chapter_id = chapter_result[0]['qid']
                else:
                    # 创建新章节
                    chapter_id = execute_query(
                        "INSERT INTO question (qname, cno) VALUES (?, ?)",
                        (chapter_name, course_id)
                    )
                
                # 关联测验和章节
                execute_query(
                    "INSERT INTO quiz_chapters (quiz_id, chapter_id) VALUES (?, ?)",
                    (quiz_id, chapter_id)
                )
                
                return jsonify({
                    "success": True, 
                    "quiz_id": quiz_id, 
                    "chapter_id": chapter_id,
                    "message": "测验已成功创建并布置到课程"
                }), 200
            
        # 普通情况返回
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
        if (quiz):
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

# 获取用户个人信息
@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    user_id = current_user['id']
    user_type = current_user['user_type']
    
    table = 'student' if user_type == 'student' else 'teacher'
    id_field = 'sno' if user_type == 'student' else 'tno'
    
    result = execute_query(
        f"SELECT * FROM {table} WHERE {id_field}=?",
        (user_id,)
    )
    
    if not result:
        return jsonify({'message': 'User not found'}), 404
    
    # 根据用户类型构建不同的响应
    if user_type == 'student':
        user_info = {
            'id': result[0]['sno'],
            'name': result[0]['name'],
            'gender': result[0]['gender'],
            'college': result[0]['college'],
            'major': result[0]['major']
        }
    else:
        user_info = {
            'id': result[0]['tno'],
            'name': result[0]['name'],
            'gender': result[0]['gender'],
            'college': result[0]['college']
        }
    
    return jsonify(user_info), 200

# # 更新用户个人信息
# @app.route('/api/user/profile', methods=['PUT'])
# @token_required
# def update_user_profile(current_user):
#     user_id = current_user['id']
#     user_type = current_user['user_type']
#     data = request.json
    
#     table = 'student' if user_type == 'student' else 'teacher'
#     id_field = 'sno' if user_type == 'student' else 'tno'
    
#     # 获取现有用户信息
#     result, _ = get_sql(f"SELECT * FROM {table} WHERE {id_field}='{user_id}'")
    
#     if not result:
#         return jsonify({'message': 'User not found'}), 404
    
#     # 构建更新数据
#     update_data_dict = {
#         id_field: user_id,
#         'name': data.get('name', result[0][1]),
#         'gender': data.get('gender', result[0][3]),
#         'college': data.get('college', result[0][4]),
#         'password': result[0][2]  # 保持密码不变
#     }
    
#     # 如果是学生，添加专业字段
#     if user_type == 'student':
#         update_data_dict['major'] = data.get('major', result[0][5])
    
#     # 更新数据库
#     update_data(update_data_dict, table)
    
#     return jsonify({'message': 'Profile updated successfully'}), 200

# # 修改密码
# @app.route('/api/user/change-password', methods=['POST'])
# @token_required
# def change_password(current_user):
#     user_id = current_user['id']
#     user_type = current_user['user_type']
#     data = request.json
    
#     current_password = data.get('currentPassword')
#     new_password = data.get('newPassword')
    
#     if not current_password or not new_password:
#         return jsonify({'message': 'Missing password information'}), 400
    
#     table = 'student' if user_type == 'student' else 'teacher'
#     id_field = 'sno' if user_type == 'student' else 'tno'
    
#     # 验证当前密码
#     result = execute_query(
#         f"SELECT password FROM {table} WHERE {id_field}=?",
#         (user_id,)
#     )
    
#     if not result or result[0]['password'] != current_password:
#         return jsonify({'message': 'Current password is incorrect'}), 401
    
#     # 更新密码
#     result, _ = get_sql(f"SELECT * FROM {table} WHERE {id_field}='{user_id}'")
    
#     update_data_dict = {
#         id_field: user_id,
#         'name': result[0][1],
#         'gender': result[0][3],
#         'college': result[0][4],
#         'password': new_password
#     }
    
#     if user_type == 'student':
#         update_data_dict['major'] = result[0][5]
    
#     update_data(update_data_dict, table)
    
#     return jsonify({'message': 'Password changed successfully'}), 200

# # 获取可选课程列表
# @app.route('/api/courses/available', methods=['GET'])
# @token_required
# def get_available_courses(current_user):
#     try:
#         # 查询所有课程
#         courses_result = execute_query("SELECT * FROM course")
        
#         available_courses = []
#         for course in courses_result:
#             # 获取教师信息
#             teacher_result = execute_query(
#                 "SELECT name FROM teacher WHERE tno=?",
#                 (course['tno'],)
#             )
#             teacher_name = teacher_result[0]['name'] if teacher_result else "未知"
            
#             # 查询该课程已选人数  
#             count_result = execute_query(
#                 "SELECT COUNT(*) as count FROM student_course WHERE cno=?",
#                 (course['cno'],)
#             )
#             count = count_result[0]['count'] if count_result else 0
            
#             course_info = {
#                 'id': course['cno'],
#                 'name': course['cname'],
#                 'teacher': teacher_name,
#                 'teacherId': course['tno'],
#                 'credits': course['credits'] if 'credits' in course else 0,
#                 'availableSlots': 50 - count,
#                 'totalEnrolled': count
#             }
            
#             available_courses.append(course_info)
        
#         return jsonify(available_courses), 200
#     except Exception as e:
#         logger.error(f"获取可选课程失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # 获取已选课程列表
# @app.route('/api/courses/selected', methods=['GET'])
# @token_required
# def get_selected_courses(current_user):
#     if current_user['user_type'] != 'student':
#         return jsonify({'message': 'Only students can access this endpoint'}), 403
    
#     student_id = current_user['id']
    
#     try:
#         # 查询学生已选课程
#         selected_courses_result, _ = get_sql(f"""
#             SELECT sc.cno, c.cname, t.name, c.credits 
#             FROM student_course sc
#             JOIN course c ON sc.cno = c.cno
#             JOIN teacher t ON c.tno = t.tno
#             WHERE sc.sno = '{student_id}'
#         """)
        
#         selected_courses = []
#         for course in selected_courses_result:
#             course_info = {
#                 'id': course[0],  # 课程号
#                 'name': course[1],  # 课程名
#                 'teacher': course[2],  # 教师姓名
#                 'credits': course[3] if course[3] else 0  # 学分
#             }
#             selected_courses.append(course_info)
        
#         return jsonify(selected_courses), 200
#     except Exception as e:
#         logger.error(f"获取已选课程失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # 选课
# @app.route('/api/courses/select', methods=['POST'])
# @token_required
# def select_course(current_user):
#     if current_user['user_type'] != 'student':
#         return jsonify({'message': 'Only students can access this endpoint'}), 403
    
#     student_id = current_user['id']
#     data = request.json
#     course_id = data.get('courseId')
    
#     if not course_id:
#         return jsonify({'message': 'Course ID is required'}), 400
    
#     try:
#         # 验证课程是否存在
#         course_result, _ = get_sql(f"SELECT * FROM course WHERE cno='{course_id}'")
#         if not course_result:
#             return jsonify({'message': 'Course not found'}), 404
        
#         # 验证学生是否已选此课程
#         selected_result, _ = get_sql(f"SELECT * FROM student_course WHERE sno='{student_id}' AND cno='{course_id}'")
#         if selected_result:
#             return jsonify({'message': 'Course already selected'}), 409
        
#         # 添加选课记录
#         insert_data({
#             'sno': student_id,
#             'cno': course_id
#         }, "student_course")
        
#         return jsonify({'message': 'Course selected successfully'}), 200
#     except Exception as e:
#         logger.error(f"选课失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # 退课
# @app.route('/api/courses/drop', methods=['POST'])
# @token_required
# def drop_course(current_user):
#     if current_user['user_type'] != 'student':
#         return jsonify({'message': 'Only students can access this endpoint'}), 403
    
#     student_id = current_user['id']
#     data = request.json
#     course_id = data.get('courseId')
    
#     if not course_id:
#         return jsonify({'message': 'Course ID is required'}), 400
    
#     try:
#         # 验证学生是否已选此课程
#         selected_result, _ = get_sql(f"SELECT * FROM student_course WHERE sno='{student_id}' AND cno='{course_id}'")
#         if not selected_result:
#             return jsonify({'message': 'Course not selected'}), 404
        
#         # 删除选课记录
#         delete_data_by_id('sno', 'cno', student_id, course_id, "student_course")
        
#         return jsonify({'message': 'Course dropped successfully'}), 200
#     except Exception as e:
#         logger.error(f"退课失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # 获取学生成绩
# @app.route('/api/grades', methods=['GET'])
# @token_required
# def get_student_grades(current_user):
#     if current_user['user_type'] != 'student':
#         return jsonify({'message': 'Only students can access this endpoint'}), 403
    
#     student_id = current_user['id']
    
#     try:
#         # 获取学生选课记录
#         result_score, _ = get_sql(f"SELECT * FROM student_course WHERE sno='{student_id}'")
        
#         grades = []
#         total_credits = 0
#         total_grade_points = 0
#         passed_courses = 0
        
#         for course_record in result_score:
#             course_id = course_record[1]
            
#             # 获取课程信息
#             course_result, _ = get_sql(f"SELECT * FROM course WHERE cno='{course_id}'")
#             if not course_result:
#                 continue
                
#             course_name = course_result[0][1]
#             credits = course_result[0][3] if len(course_result[0]) > 3 else 0
            
#             # 获取教师信息
#             teacher_result, _ = get_sql(f"SELECT name FROM teacher WHERE tno='{course_result[0][2]}'")
#             teacher_name = teacher_result[0][0] if teacher_result else "未知"
            
#             # 查询学生在该课程的正确率
#             accuracy_results, _ = get_sql(f"""
#                 SELECT SUM(correctcnt) AS correct, SUM(allcnt) AS total
#                 FROM student_answer
#                 WHERE sno='{student_id}' AND cno='{course_id}'
#             """)
            
#             # 计算成绩（假设根据正确率来计算分数）
#             score = 0
#             if accuracy_results and accuracy_results[0][1]:
#                 correct = accuracy_results[0][0] or 0
#                 total = accuracy_results[0][1] or 1
#                 score = round((correct / total) * 100)  # 转换为百分制
            
#             # 累计学分和GPA
#             if score >= 60:
#                 passed_courses += 1
#                 total_credits += credits
                
#                 # 简单的GPA计算方法
#                 if score >= 90:
#                     grade_point = 4.0
#                 elif score >= 80:
#                     grade_point = 3.0
#                 elif score >= 70:
#                     grade_point = 2.0
#                 else:
#                     grade_point = 1.0
                
#                 total_grade_points += grade_point * credits
            
#             grade = {
#                 'id': len(grades) + 1,
#                 'courseId': course_id,
#                 'courseName': course_name,
#                 'teacher': teacher_name,
#                 'credits': credits,
#                 'score': score
#             }
            
#             grades.append(grade)
        
#         # 计算GPA
#         gpa = round(total_grade_points / total_credits, 2) if total_credits > 0 else 0.0
        
#         return jsonify({
#             'grades': grades,
#             'stats': {
#                 'totalCredits': total_credits,
#                 'gpa': gpa,
#                 'passedCourses': passed_courses,
#                 'totalCourses': len(grades)
#             }
#         }), 200
#     except Exception as e:
#         logger.error(f"获取学生成绩失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500
# # 教师查看课程学生
# @app.route('/api/teacher/courses', methods=['GET'])
# @token_required
# def get_teacher_courses(current_user):
#     if current_user['user_type'] != 'teacher':
#         return jsonify({'message': 'Only teachers can access this endpoint'}), 403
    
#     teacher_id = current_user['id']
    
#     try:
#         # 查询教师的课程
#         courses_result, _ = get_sql(f"SELECT * FROM course WHERE tno='{teacher_id}'")
        
#         courses = []
#         for course in courses_result:
#             course_id = course[0]
#             course_name = course[1]
            
#             # 查询选课学生
#             students_result, _ = get_sql(f"""
#                 SELECT s.sno, s.name, s.gender, s.college, s.major
#                 FROM student s
#                 JOIN student_course sc ON s.sno = sc.sno
#                 WHERE sc.cno = '{course_id}'
#             """)
            
#             students = []
#             for student in students_result:
#                 student_info = {
#                     'id': student[0],
#                     'name': student[1],
#                     'gender': student[2],
#                     'college': student[3],
#                     'major': student[4]
#                 }
#                 students.append(student_info)
            
#             course_info = {
#                 'id': course_id,
#                 'name': course_name,
#                 'studentCount': len(students),
#                 'students': students
#             }
            
#             courses.append(course_info)
        
#         return jsonify(courses), 200
#     except Exception as e:
#         logger.error(f"获取教师课程失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # 教师查看课程答题统计
# @app.route('/api/teacher/course-stats', methods=['GET'])
# @token_required
# def get_course_stats(current_user):
#     if current_user['user_type'] != 'teacher':
#         return jsonify({'message': 'Only teachers can access this endpoint'}), 403
    
#     teacher_id = current_user['id']
    
#     try:
#         # 查询教师所教授的课程
#         result_course, _ = get_sql(f"SELECT * FROM course WHERE tno='{teacher_id}'")
        
#         course_stats = []
        
#         for course in result_course:
#             cno = course[0]
#             cname = course[1]
            
#             # 统计每个章节的答题正确率
#             result_chapters, _ = get_sql(f"""
#                 SELECT q.qname, 
#                        SUM(sa.correctcnt) AS total_correct, 
#                        SUM(sa.allcnt) AS total_attempts
#                 FROM student_answer sa
#                 JOIN question q ON sa.qid = q.qid
#                 WHERE sa.cno = '{cno}'
#                 GROUP BY q.qname
#             """)
            
#             chapters = []
#             for chapter in result_chapters:
#                 qname = chapter[0]
#                 total_correct = chapter[1] or 0
#                 total_attempts = chapter[2] or 1
                
#                 # 计算正确率
#                 accuracy = round((total_correct / total_attempts) * 100, 2)
                
#                 chapter_stat = {
#                     'chapterName': qname,
#                     'totalAttempts': total_attempts,
#                     'totalCorrect': total_correct,
#                     'accuracy': accuracy
#                 }
                
#                 chapters.append(chapter_stat)
            
#             course_stat = {
#                 'id': cno,
#                 'name': cname,
#                 'chapters': chapters
#             }
            
#             course_stats.append(course_stat)
        
#         return jsonify(course_stats), 200
#     except Exception as e:
#         logger.error(f"获取课程统计失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500
# # 学生答题正确率查询
# @app.route('/api/student/accuracy', methods=['GET'])
# @token_required
# def get_student_accuracy(current_user):
#     if current_user['user_type'] != 'student':
#         return jsonify({'message': 'Only students can access this endpoint'}), 403
    
#     student_id = current_user['id']
    
#     try:
#         # 获取学生选课记录
#         result_score, _ = get_sql(f"SELECT * FROM student_course WHERE sno='{student_id}'")
        
#         accuracy_data = []
        
#         for course_record in result_score:
#             course_id = course_record[1]
            
#             # 获取课程信息
#             course_result, _ = get_sql(f"SELECT * FROM course WHERE cno='{course_id}'")
#             if not course_result:
#                 continue
                
#             course_name = course_result[0][1]
            
#             # 获取教师信息
#             teacher_result, _ = get_sql(f"SELECT name FROM teacher WHERE tno='{course_result[0][2]}'")
#             teacher_name = teacher_result[0][0] if teacher_result else "未知"
            
#             # 获取学生在该课程每个章节的答题情况
#             result_answers, _ = get_sql(f"""
#                 SELECT sa.qid, sa.allcnt, sa.correctcnt, q.qname
#                 FROM student_answer sa
#                 JOIN question q ON sa.qid = q.qid
#                 WHERE sa.sno='{student_id}' AND sa.cno='{course_id}'
#             """)
            
#             for answer in result_answers:
#                 qid = answer[0]
#                 allcnt = answer[1]
#                 correctcnt = answer[2]
#                 qname = answer[3]
                
#                 # 计算正确率
#                 accuracy = round((correctcnt / allcnt) * 100, 2) if allcnt > 0 else 0.00
                
#                 accuracy_item = {
#                     'courseId': course_id,
#                     'courseName': course_name,
#                     'teacherName': teacher_name,
#                     'chapterId': qid,
#                     'chapterName': qname,
#                     'totalQuestions': allcnt,
#                     'correctAnswers': correctcnt,
#                     'accuracy': accuracy
#                 }
                
#                 accuracy_data.append(accuracy_item)
        
#         return jsonify(accuracy_data), 200
#     except Exception as e:
#         logger.error(f"获取学生答题正确率失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500
# # 添加以下接口

# # 教师布置测验
# @app.route('/api/teacher/assign-quiz', methods=['POST'])
# @token_required
# def assign_quiz(current_user):
#     if current_user['user_type'] != 'teacher':
#         return jsonify({'message': 'Only teachers can access this endpoint'}), 403
    
#     teacher_id = current_user['id']
#     data = request.json
#     course_id = data.get('courseId')
#     quiz_id = data.get('quizId')
#     chapter_name = data.get('chapterName', '未命名章节')
    
#     if not course_id or not quiz_id:
#         return jsonify({'message': '缺少必要参数'}), 400
    
#     try:
#         # 验证课程是否属于该教师
#         course_result, _ = get_sql(f"SELECT * FROM course WHERE cno='{course_id}' AND tno='{teacher_id}'")
#         if not course_result:
#             return jsonify({'message': '您没有权限为此课程布置测验'}), 403
        
#         # 验证测验是否存在
#         quiz = get_quiz_by_id(quiz_id)
#         if not quiz:
#             return jsonify({'message': '测验不存在'}), 404
        
#         # 检查章节是否已存在
#         chapter_result, _ = get_sql(f"SELECT * FROM question WHERE qname='{chapter_name}' AND cno='{course_id}'")
        
#         if chapter_result:
#             chapter_id = chapter_result[0][0]
#         else:
#             # 创建新章节
#             cursor = sqlite3.connect('database.db').cursor()
#             cursor.execute("INSERT INTO question (qname, cno) VALUES (?, ?)", 
#                           (chapter_name, course_id))
#             chapter_id = cursor.lastrowid
#             cursor.connection.commit()
#             cursor.connection.close()
        
#         # 将测验与章节关联 (在实际应用中可能需要更复杂的关系表)
#         # 这里简单地使用quiz_chapters表来关联
#         conn = sqlite3.connect('database.db')
#         cursor = conn.cursor()
        
#         # 创建quiz_chapters表（如果不存在）
#         cursor.execute('''
#         CREATE TABLE IF NOT EXISTS quiz_chapters (
#             quiz_id INTEGER,
#             chapter_id INTEGER,
#             PRIMARY KEY (quiz_id, chapter_id)
#         )
#         ''')
        
#         # 检查关联是否已存在
#         cursor.execute("SELECT * FROM quiz_chapters WHERE quiz_id=? AND chapter_id=?", 
#                        (quiz_id, chapter_id))
#         if not cursor.fetchone():
#             cursor.execute("INSERT INTO quiz_chapters VALUES (?, ?)", 
#                            (quiz_id, chapter_id))
        
#         conn.commit()
#         conn.close()
        
#         return jsonify({
#             'message': '测验布置成功',
#             'chapterId': chapter_id
#         }), 200
        
#     except Exception as e:
#         logger.error(f"布置测验失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # 教师获取布置的测验
# @app.route('/api/teacher/assigned-quizzes', methods=['GET'])
# @token_required
# def get_assigned_quizzes(current_user):
#     if current_user['user_type'] != 'teacher':
#         return jsonify({'message': 'Only teachers can access this endpoint'}), 403
    
#     teacher_id = current_user['id']
    
#     try:
#         # 获取教师的课程
#         courses_result, _ = get_sql(f"SELECT cno, cname FROM course WHERE tno='{teacher_id}'")
        
#         assigned_quizzes = []
        
#         for course in courses_result:
#             course_id = course[0]
#             course_name = course[1]
            
#             # 获取课程的章节
#             chapters_result, _ = get_sql(f"SELECT qid, qname FROM question WHERE cno='{course_id}'")
            
#             for chapter in chapters_result:
#                 chapter_id = chapter[0]
#                 chapter_name = chapter[1]
                
#                 # 获取章节对应的测验
#                 conn = sqlite3.connect('database.db')
#                 conn.row_factory = sqlite3.Row
#                 cursor = conn.cursor()
                
#                 cursor.execute('''
#                 SELECT q.id, q.title, q.question_count, q.difficulty, q.created_at
#                 FROM quiz_chapters qc
#                 JOIN quizzes q ON qc.quiz_id = q.id
#                 WHERE qc.chapter_id = ?
#                 ''', (chapter_id,))
                
#                 quizzes = []
#                 for row in cursor.fetchall():
#                     quiz = dict(row)
#                     quizzes.append(quiz)
                
#                 conn.close()
                
#                 # 只有当有测验时才添加该章节
#                 if quizzes:
#                     assigned_quiz = {
#                         'courseId': course_id,
#                         'courseName': course_name,
#                         'chapterId': chapter_id,
#                         'chapterName': chapter_name,
#                         'quizzes': quizzes
#                     }
#                     assigned_quizzes.append(assigned_quiz)
        
#         return jsonify(assigned_quizzes), 200
        
#     except Exception as e:
#         logger.error(f"获取已布置测验失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # 教师查看特定学生的测验成绩
# @app.route('/api/teacher/student-performance', methods=['GET'])
# @token_required
# def get_student_performance(current_user):
#     if current_user['user_type'] != 'teacher':
#         return jsonify({'message': 'Only teachers can access this endpoint'}), 403
    
#     teacher_id = current_user['id']
#     student_id = request.args.get('studentId')
#     course_id = request.args.get('courseId')
    
#     if not student_id or not course_id:
#         return jsonify({'message': '缺少必要参数'}), 400
    
#     try:
#         # 验证课程是否属于该教师
#         course_result, _ = get_sql(f"SELECT * FROM course WHERE cno='{course_id}' AND tno='{teacher_id}'")
#         if not course_result:
#             return jsonify({'message': '您没有权限查看此课程'}), 403
        
#         # 验证学生是否选修了该课程
#         enrollment_result, _ = get_sql(f"SELECT * FROM student_course WHERE sno='{student_id}' AND cno='{course_id}'")
#         if not enrollment_result:
#             return jsonify({'message': '该学生未选修此课程'}), 404
        
#         # 获取学生信息
#         student_result, _ = get_sql(f"SELECT * FROM student WHERE sno='{student_id}'")
#         if not student_result:
#             return jsonify({'message': '学生不存在'}), 404
        
#         student_info = {
#             'id': student_result[0][0],
#             'name': student_result[0][1],
#             'gender': student_result[0][3],
#             'college': student_result[0][4],
#             'major': student_result[0][5]
#         }
        
#         # 获取课程信息
#         course_name = course_result[0][1]
        
#         # 获取学生在该课程的每个章节的成绩
#         performance_result, _ = get_sql(f"""
#             SELECT sa.qid, q.qname, sa.allcnt, sa.correctcnt
#             FROM student_answer sa
#             JOIN question q ON sa.qid = q.qid
#             WHERE sa.sno='{student_id}' AND sa.cno='{course_id}'
#         """)
        
#         chapters = []
#         overall_correct = 0
#         overall_total = 0
        
#         for record in performance_result:
#             chapter_id = record[0]
#             chapter_name = record[1]
#             total_questions = record[2]
#             correct_answers = record[3]
            
#             accuracy = round((correct_answers / total_questions) * 100, 2) if total_questions > 0 else 0
            
#             overall_correct += correct_answers
#             overall_total += total_questions
            
#             chapter = {
#                 'chapterId': chapter_id,
#                 'chapterName': chapter_name,
#                 'totalQuestions': total_questions,
#                 'correctAnswers': correct_answers,
#                 'accuracy': accuracy
#             }
            
#             chapters.append(chapter)
        
#         overall_accuracy = round((overall_correct / overall_total) * 100, 2) if overall_total > 0 else 0
        
#         return jsonify({
#             'student': student_info,
#             'course': {
#                 'id': course_id,
#                 'name': course_name
#             },
#             'overallPerformance': {
#                 'totalQuestions': overall_total,
#                 'correctAnswers': overall_correct,
#                 'accuracy': overall_accuracy
#             },
#             'chapterPerformance': chapters
#         }), 200
        
#     except Exception as e:
#         logger.error(f"获取学生表现失败: {str(e)}")
#         return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)