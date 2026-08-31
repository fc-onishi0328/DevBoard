FROM node:20-bookworm-slim

WORKDIR /app

# better-sqlite3のネイティブビルドに必要
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3001

CMD ["npm", "run", "dev"]
