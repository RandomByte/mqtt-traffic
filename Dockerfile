FROM node:14-alpine

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

COPY ./index.js .

ENV MQTT_TRAFFIC_ORIGIN=
ENV MQTT_TRAFFIC_DESTINATION=
ENV MQTT_TRAFFIC_LANGUAGE=en
ENV MQTT_TRAFFIC_API_KEY=
ENV MQTT_TRAFFIC_MQTT_BROKER=
ENV MQTT_TRAFFIC_MQTT_TOPIC_PREFIX=

CMD [ "npm", "start" ]
