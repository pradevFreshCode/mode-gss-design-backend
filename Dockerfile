FROM node:10
RUN mkdir -p /opt/mode-gss-design-backend
WORKDIR /opt/mode-gss-design-backend
COPY package.json /opt/mode-gss-design-backend
RUN npm install
COPY . /opt/mode-gss-design-backend
EXPOSE 3000
CMD [ "npm", “dev” ]
