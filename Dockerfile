FROM node:10.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN apt install g++

RUN npm install

EXPOSE 3000