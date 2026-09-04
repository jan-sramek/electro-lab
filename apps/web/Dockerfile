FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
# Public origin baked into canonical/OG/JSON-LD/sitemap. Required for production builds
# (the build fails on a missing or placeholder value). Pass via `docker build --build-arg SITE_ORIGIN=...`.
ARG SITE_ORIGIN
ENV SITE_ORIGIN=$SITE_ORIGIN
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/web/browser /usr/share/nginx/html
EXPOSE 80
