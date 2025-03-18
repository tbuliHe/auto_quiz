import sqlite3
import os
import logging
import json
logger = logging.getLogger(__name__)

DB_PATH = 'database.db'

def get_db_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def execute_query(query, params=None, fetchall=True):
    """执行SQL查询"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if query.strip().upper().startswith(('SELECT', 'PRAGMA')):
            if fetchall:
                result = cursor.fetchall()
            else:
                result = cursor.fetchone()
            return result
        else:
            conn.commit()
            return cursor.lastrowid
            
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"数据库操作失败: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

def init_database():
    """初始化并创建所有数据库表"""
    try:
        # 测验相关表
        execute_query('''
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            file_name TEXT,
            quiz_json TEXT,
            question_count INTEGER,
            difficulty TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        execute_query('''
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER,
            analysis_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
        )
        ''')
        
        # 用户管理相关表
        # 教师表
        execute_query('''
        CREATE TABLE IF NOT EXISTS teacher (
            tno TEXT PRIMARY KEY,
            name TEXT,
            password TEXT,
            gender TEXT,
            college TEXT
        )
        ''')
        
        # 学生表
        execute_query('''
        CREATE TABLE IF NOT EXISTS student (
            sno TEXT PRIMARY KEY,
            name TEXT,
            password TEXT,
            gender TEXT,
            college TEXT,
            major TEXT
        )
        ''')
        
        # 课程表
        execute_query('''
        CREATE TABLE IF NOT EXISTS course (
            cno TEXT PRIMARY KEY,
            cname TEXT,
            tno TEXT,
            credits INTEGER,
            FOREIGN KEY (tno) REFERENCES teacher(tno)
        )
        ''')
        
        # 学生选课表
        execute_query('''
        CREATE TABLE IF NOT EXISTS student_course (
            sno TEXT,
            cno TEXT,
            PRIMARY KEY (sno, cno),
            FOREIGN KEY (sno) REFERENCES student(sno),
            FOREIGN KEY (cno) REFERENCES course(cno)
        )
        ''')
        
        # 章节表
        execute_query('''
        CREATE TABLE IF NOT EXISTS question (
            qid INTEGER PRIMARY KEY AUTOINCREMENT,
            qname TEXT,
            cno TEXT,
            FOREIGN KEY (cno) REFERENCES course(cno)
        )
        ''')
        
        # 答题情况表
        execute_query('''
        CREATE TABLE IF NOT EXISTS student_answer (
            sno TEXT,
            cno TEXT,
            qid INTEGER,
            allcnt INTEGER,
            correctcnt INTEGER,
            PRIMARY KEY (sno, cno, qid),
            FOREIGN KEY (sno) REFERENCES student(sno),
            FOREIGN KEY (cno) REFERENCES course(cno),
            FOREIGN KEY (qid) REFERENCES question(qid)
        )
        ''')
        
        # 测验章节关联表
        execute_query('''
        CREATE TABLE IF NOT EXISTS quiz_chapters (
            quiz_id INTEGER,
            chapter_id INTEGER,
            PRIMARY KEY (quiz_id, chapter_id),
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
            FOREIGN KEY (chapter_id) REFERENCES question(qid)
        )
        ''')
        
        # 插入测试数据（如果表是空的）
        if not execute_query("SELECT * FROM teacher LIMIT 1"):
            _initialize_test_data()
            
        logger.info("数据库初始化成功")
        return True
        
    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        return False

def _initialize_test_data():
    """初始化测试数据"""
    # 插入示例教师
    execute_query("INSERT INTO teacher VALUES (?, ?, ?, ?, ?)", 
        ("T001", "张教授", "123456", "男", "计算机学院"))
    execute_query("INSERT INTO teacher VALUES (?, ?, ?, ?, ?)", 
        ("T002", "李教授", "123456", "女", "数学学院"))
            
    # 插入示例学生
    execute_query("INSERT INTO student VALUES (?, ?, ?, ?, ?, ?)", 
        ("S001", "王同学", "123456", "男", "计算机学院", "计算机科学"))
    execute_query("INSERT INTO student VALUES (?, ?, ?, ?, ?, ?)", 
        ("S002", "李同学", "123456", "女", "数学学院", "应用数学"))
            
    # 插入示例课程
    execute_query("INSERT INTO course VALUES (?, ?, ?, ?)", 
        ("CS101", "计算机导论", "T001", 3))
    execute_query("INSERT INTO course VALUES (?, ?, ?, ?)", 
        ("MATH201", "高等数学", "T002", 4))
        
    # 插入示例选课关系
    execute_query("INSERT INTO student_course VALUES (?, ?)", ("S001", "CS101"))
    execute_query("INSERT INTO student_course VALUES (?, ?)", ("S001", "MATH201"))
    execute_query("INSERT INTO student_course VALUES (?, ?)", ("S002", "MATH201"))
        
    # 插入示例章节
    execute_query("INSERT INTO question (qname, cno) VALUES (?, ?)", ("第一章 计算机基础", "CS101"))
    execute_query("INSERT INTO question (qname, cno) VALUES (?, ?)", ("第二章 编程概念", "CS101"))
    execute_query("INSERT INTO question (qname, cno) VALUES (?, ?)", ("第一章 函数与极限", "MATH201"))
        
    # 插入示例答题情况
    execute_query("INSERT INTO student_answer VALUES (?, ?, ?, ?, ?)", ("S001", "CS101", 1, 10, 8))
    execute_query("INSERT INTO student_answer VALUES (?, ?, ?, ?, ?)", ("S001", "CS101", 2, 10, 7))
    execute_query("INSERT INTO student_answer VALUES (?, ?, ?, ?, ?)", ("S001", "MATH201", 3, 10, 6))
    
    logger.info("测试数据初始化完成")

def insert_data(data_dict, table_name):
    """向指定表中插入数据"""
    columns = ', '.join(data_dict.keys())
    placeholders = ', '.join(['?' for _ in data_dict.keys()])
    values = tuple(data_dict.values())
    
    query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
    return execute_query(query, values)

def update_data(data_dict, table_name):
    """更新表中的数据"""
    id_field = next(iter(data_dict))  # 假设第一个键是ID字段
    id_value = data_dict[id_field]
    
    # 移除主键后构建SET子句
    set_clause_items = [f"{k} = ?" for k in data_dict.keys() if k != id_field]
    set_clause = ', '.join(set_clause_items)
    
    # 构建值元组（排除主键值）
    values = tuple(v for k, v in data_dict.items() if k != id_field)
    
    # 将主键值添加到最后（用于WHERE条件）
    values = values + (id_value,)
    
    query = f"UPDATE {table_name} SET {set_clause} WHERE {id_field} = ?"
    return execute_query(query, values)

def delete_data_by_id(field1, field2, value1, value2, table_name):
    """从表中删除指定数据"""
    query = f"DELETE FROM {table_name} WHERE {field1} = ? AND {field2} = ?"
    return execute_query(query, (value1, value2))

# 测验和分析相关功能
def save_quiz(title, file_name, quiz_json, question_count, difficulty):
    """保存测验到数据库"""
    query = '''
    INSERT INTO quizzes (title, file_name, quiz_json, question_count, difficulty)
    VALUES (?, ?, ?, ?, ?)
    '''
    return execute_query(query, (title, file_name, quiz_json, question_count, difficulty))

def save_analysis(quiz_id, analysis_json):
    """保存分析到数据库"""
    query = '''
    INSERT INTO analyses (quiz_id, analysis_json)
    VALUES (?, ?)
    '''
    return execute_query(query, (quiz_id, analysis_json))

def get_quiz_by_id(quiz_id):
    """根据ID获取测验"""
    query = "SELECT * FROM quizzes WHERE id = ?"
    result = execute_query(query, (quiz_id,), fetchall=False)
    if not result:
        return None
    
    return {
        'id': result['id'],
        'title': result['title'],
        'file_name': result['file_name'],
        'quiz_json': result['quiz_json'],
        'question_count': result['question_count'],
        'difficulty': result['difficulty'],
        'created_at': result['created_at']
    }

def get_all_quizzes():
    """获取所有测验"""
    query = "SELECT * FROM quizzes ORDER BY created_at DESC"
    results = execute_query(query)
    return [dict(row) for row in results]

def get_analysis_by_id(analysis_id):
    """根据ID获取分析"""
    query = """
    SELECT a.*, q.title as quiz_title, q.file_name 
    FROM analyses a 
    JOIN quizzes q ON a.quiz_id = q.id 
    WHERE a.id = ?
    """
    result = execute_query(query, (analysis_id,), fetchall=False)
    if not result:
        return None
    
    # 解析JSON
    analysis_data = json.loads(result['analysis_json'])
    analysis_data['id'] = result['id']
    analysis_data['quiz_id'] = result['quiz_id']
    analysis_data['quiz_title'] = result['quiz_title']
    analysis_data['file_name'] = result['file_name']
    analysis_data['created_at'] = result['created_at']
    
    return analysis_data

def get_all_analyses():
    """获取所有分析"""
    query = """
    SELECT a.id, a.quiz_id, a.created_at, q.title as quiz_title, q.file_name
    FROM analyses a
    JOIN quizzes q ON a.quiz_id = q.id
    ORDER BY a.created_at DESC
    """
    results = execute_query(query)
    return [dict(row) for row in results]