FROM nginx:1.27-alpine
# Certificado autoassinado: permite HTTPS (exigido pela câmera no celular).
RUN apk add --no-cache openssl \
 && mkdir -p /etc/nginx/certs \
 && openssl req -x509 -nodes -newkey rsa:2048 -days 825 -subj "/CN=industria-ra" \
      -keyout /etc/nginx/certs/key.pem -out /etc/nginx/certs/cert.pem
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html calibrar.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY assets /usr/share/nginx/html/assets
