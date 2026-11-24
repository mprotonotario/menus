# Etapa 1: Imagen base ligera con Node.js 20 en Alpine Linux
FROM node:20-alpine AS base

# Etapa 2: Instalación de dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia de archivos de paquetes para aprovechar la caché de Docker
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Etapa 3: Construcción de la aplicación Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el proceso de compilación
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Etapa 4: Imagen final de producción (Runner ultra liviano)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario y grupo de seguridad sin privilegios de root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos públicos y estáticos compilados
COPY --from=builder /app/public ./public

# Configurar permisos para la caché de Next.js
RUN mkdir .next && chown nextjs:nodejs .next

# Copiar artefactos optimizados del build 'standalone'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
