FROM node:20-alpine
WORKDIR /app
COPY server.mjs ./
EXPOSE 8788
CMD ["node", "server.mjs"]
