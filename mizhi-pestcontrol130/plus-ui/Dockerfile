FROM hub.nwafu.edu.cn/library/nginx:latest
LABEL maintainer="lisong@nwafu.edu.cn"
VOLUME /tmp
ENV LANG en_US.UTF-8 TZ=Asia/Shanghai

RUN mkdir  -p  /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/ /usr/share/nginx/html
EXPOSE 81