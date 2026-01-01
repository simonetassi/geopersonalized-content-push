FROM node:20-alpine AS builder

WORKDIR /app

# install necessary tools for compiling better-sqlite3 
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src

RUN npm run build

RUN npm prune --production

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

RUN mkdir -p storage

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]

