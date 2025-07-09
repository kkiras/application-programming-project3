# frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Sao chép lockfile và package.json để cache cài đặt dependencies
COPY pnpm-lock.yaml package.json ./

# Cài đặt pnpm và dependencies
RUN npm install -g pnpm && pnpm install

# Sao chép toàn bộ source code vào image
COPY . .

# Build ứng dụng Next.js
RUN pnpm build

# Expose cổng 3000 cho ứng dụng
EXPOSE 3000

CMD ["pnpm", "start"]
