FROM node:20-alpine AS builder
WORKDIR /app

# Instalar openssl para o Prisma
RUN apk add --no-cache openssl

# Copiar arquivos de dependência
COPY package.json package-lock.json ./

# Instalar sem rodar postinstall
RUN npm ci --ignore-scripts

# Copiar resto dos arquivos
COPY . .

# Gerar Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build da aplicação
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node server.js"]
