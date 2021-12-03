FROM node:16-alpine3.14
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node index.js
