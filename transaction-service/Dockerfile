FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY index.js ./

EXPOSE 8083

CMD ["npm", "start"]
