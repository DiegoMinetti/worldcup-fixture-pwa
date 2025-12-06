FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production=false
COPY . .
ENV HOST=0.0.0.0
EXPOSE 5173
CMD ["npm", "run", "dev"]
