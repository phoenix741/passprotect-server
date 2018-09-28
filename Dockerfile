#
# -------- Base ---------

FROM node:10 as base
MAINTAINER Ulrich Van Den Hekke <ulrich.vdh@shadoware.org>

WORKDIR /src
COPY package.json /src

#
# -------- Dependencies --------
FROM base as dependencies

RUN apt install make gcc g++ python
RUN npm install --production

#
# -------- Dist -----------
FROM base AS dist

COPY config ./config
COPY server ./server
COPY package.json ./
COPY package-lock.json ./
COPY --from=dependencies /src/node_modules /src/node_modules

ENV MODE=prod
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "--experimental-modules", "server/app"]
