FROM node:alpine

ENV APP_HOME=/var/app/current
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
RUN rm -rf /var/app/current
COPY . $APP_HOME

RUN cd $APP_HOME
RUN npm i
RUN npm run build

RUN npm run start