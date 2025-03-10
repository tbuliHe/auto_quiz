#!/bin/bash

# 定义前后端目录
FRONTEND_DIR="/home/dim/code/auto_quiz/frontend"
BACKEND_DIR="/home/dim/code/auto_quiz/backend"

# 启动前端
echo "启动前端..."
gnome-terminal -- bash -c "cd $FRONTEND_DIR && npm start; exec bash" &
FRONTEND_PID=$!

# 启动后端
echo "启动后端..."
gnome-terminal -- bash -c "cd $BACKEND_DIR && python app.py; exec bash" &
BACKEND_PID=$!

# 等待几秒钟以确保服务启动
sleep 5

# # 检查前端是否运行
# if ps -p $FRONTEND_PID > /dev/null
# then
#    echo "前端运行中 (PID: $FRONTEND_PID)"
# else
#    echo "前端启动失败"
#    exit 1
# fi

# # 检查后端是否运行
# if ps -p $BACKEND_PID > /dev/null
# then
#    echo "后端运行中 (PID: $BACKEND_PID)"
# else
#    echo "后端启动失败"
#    exit 1
# fi

# 等待前后端进程结束
wait $FRONTEND_PID
wait $BACKEND_PID