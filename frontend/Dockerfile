FROM node:20-alpine

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

CMD ["pnpm", "start"]




