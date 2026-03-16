FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install all deps (including devDeps for prisma CLI), generate client, then prune
RUN npm ci && npx prisma generate && npm prune --omit=dev

COPY . .

RUN mkdir -p logs

EXPOSE 5001

CMD ["node", "src/index.js"]
