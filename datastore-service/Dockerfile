FROM node:18.18.2-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

# we use diskusage npm package to get the disk usage of the current directory
# it requires python and make to be installed
RUN apk add --no-cache --virtual .gyp \
        py3-pip \
        make \
        g++ \
    && npm install \
    && apk del .gyp

# RUN npm install

COPY . .

RUN npm run build

CMD ["node", "build/index.js"]
