# Imagen base con Node.js 20 en Alpine Linux
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copia de archivos de paquetes e instalación de dependencias
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copia inicial del código fuente
COPY . .

# Variables de entorno para compilación y producción
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Compilación inicial durante la construcción de la imagen
RUN npm run build

EXPOSE 3000

# Al iniciar o reiniciar el contenedor (docker compose restart), recompila y arranca
CMD ["sh", "-c", "npm run build && npm start"]
