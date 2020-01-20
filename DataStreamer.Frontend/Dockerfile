# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /frontend-app


# add `/frontend-app/node_modules/.bin` to $PATH
ENV PATH /frontend-app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install --silent
#RUN npm install react-scripts@3.3.0 -g --silent

COPY public public
COPY src src

RUN npm run build

# start app
CMD ["npm", "start"]