FROM node:slim

ENV APP_HOME=/var/app/current
ENV PORT=8080
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
RUN rm -rf /var/app/current
COPY . $APP_HOME

RUN cd $APP_HOME
RUN npm i
RUN npm i -g typescript
RUN npm run build
EXPOSE ${PORT}

CMD npm run start