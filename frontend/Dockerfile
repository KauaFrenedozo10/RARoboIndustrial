FROM nginx:1.27-alpine
# Certificado autoassinado: permite HTTPS (exigido pela câmera no celular).
RUN apk add --no-cache openssl \
 && mkdir -p /etc/nginx/certs \
 && openssl req -x509 -nodes -newkey rsa:2048 -days 825 -subj "/CN=industria-ra" \
      -keyout /etc/nginx/certs/key.pem -out /etc/nginx/certs/cert.pem
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
# Mesma estrutura do repositório: index.html na raiz e css/js/assets em /frontend
COPY index.html calibrar.html /usr/share/nginx/html/
COPY frontend/css /usr/share/nginx/html/frontend/css
COPY frontend/js /usr/share/nginx/html/frontend/js
COPY frontend/assets /usr/share/nginx/html/frontend/assets
