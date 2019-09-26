#!/bin/bash
WORK_PATH='/usr/projects/vue-back'
cd $WORK_PATH
echo "清理代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "开始构建镜像"
# .表示当前目录，会去当前目录下去找dockerfile文件去构建
docker build -t vue-back .
echo "删除旧容器"
docker stop vue-back-container
docker rm vue-back-container
echo "启动新容器"
# 端口映射 把宿主机3000映射容器3000端口 -d后台运行 基于vue-back镜像启动一个服务，容器叫vue-back-container
docker container run -p 3000:3000 -d --name vue-back-container vue-back