FROM node:12

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
RUN npm run build

ENV NODE_ENV production

EXPOSE 3000 
EXPOSE 9991


CMD [ "node", "./dist/index.js" ]