# build stage
FROM node:lts-alpine

# ENV GIT_COMMIT_TAG ${gitcommithash:-gitcommithash}
# install simple http server for serving static content
#RUN npm install -g http-server
RUN npm install -g serve

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

RUN printenv
# build app for production with minification
RUN npx quasar build

EXPOSE 3100

ENTRYPOINT [ "serve" , "--listen" , "3100"]


# # production stage
# FROM nginx:stable-alpine as production-stage
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]