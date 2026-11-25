FROM node:24-alpine AS build

WORKDIR /app
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

FROM nginx:1.30.8-alpine

COPY deploy/vps/nginx.conf /etc/nginx/nginx.conf
COPY deploy/vps/entrypoint.sh /usr/local/bin/academy-entrypoint
COPY --from=build --chown=nginx:nginx /app/dist/ /usr/share/nginx/html/
RUN chmod 0755 /usr/local/bin/academy-entrypoint

USER nginx
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/academy-entrypoint"]

