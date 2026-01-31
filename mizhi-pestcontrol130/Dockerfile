# 贝尔实验室 Spring 官方推荐镜像 JDK下载地址 https://bell-sw.com/pages/downloads/
FROM hub.nwafu.edu.cn/public/liberica-openjdk-debian:17.0.11-cds
#FROM bellsoft/liberica-openjdk-debian:21.0.3-cds
#FROM findepi/graalvm:java17-native

LABEL maintainer="lisong"

ARG workdir=/mizhi-pestcontrol
WORKDIR ${workdir}

ENV LANG=C.UTF-8 LC_ALL=C.UTF-8 JAVA_OPTS=""


# ADD ./target/*.jar app.jar
COPY ./app.jar app.jar

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

ENTRYPOINT java -Djava.security.egd=file:/dev/./urandom \
           -XX:+HeapDumpOnOutOfMemoryError -XX:+UseZGC ${JAVA_OPTS} \
           -jar app.jar
