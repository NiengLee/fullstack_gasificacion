FROM node:22.12.0-alpine AS build
WORKDIR /app

# Instala deps con caché eficiente
COPY package*.json ./
RUN npm ci

# Copia el código y construye
COPY . .
# Si usas TypeScript/Vite por defecto: "build"
RUN npm run build

# Etapa de runtime: sirve estáticos con Nginx
FROM nginx:1.27-alpine AS runtime
# Copia artefactos de build
COPY --from=build /app/dist /usr/share/nginx/html
# Config SPA + caché
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1

