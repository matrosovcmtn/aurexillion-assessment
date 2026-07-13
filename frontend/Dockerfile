FROM node:26.5-alpine3.23 AS build

WORKDIR /app

RUN apk add --no-cache git
RUN npm install -g pnpm@11.11.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

ARG VITE_API_URL=

RUN pnpm build

FROM nginx:1.31.2-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
