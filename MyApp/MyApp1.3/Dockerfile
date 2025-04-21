FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]