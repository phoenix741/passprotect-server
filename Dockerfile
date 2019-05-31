#
# -------- Base ---------

FROM node:10-alpine as dependencies
LABEL MAINTAINER="Ulrich Van Den Hekke <ulrich.vdh@shadoware.org>"

RUN apk --no-cache add --virtual builds-deps build-base python

WORKDIR /src
COPY package.json /src
COPY package-lock.json /src
RUN npm install --production

#
# -------- Build --------
FROM dependencies as build

RUN npm install
COPY . /src/
RUN npm run build

#
# -------- Dist -----------
FROM node:10-alpine AS dist

WORKDIR /src
COPY --from=build /src/dist/ /src/
COPY --from=dependencies /src/node_modules /src/node_modules

ENV MODE=prod
ENV NODE_ENV=production

EXPOSE 4000
CMD ["node", "/src/main.js"]
