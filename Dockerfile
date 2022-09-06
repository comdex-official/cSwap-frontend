FROM nginx
RUN sed -i '13s/#/ /' /etc/nginx/conf.d/default.conf
RUN sed -i '13s/404.html/index.html/' /etc/nginx/conf.d/default.conf
COPY html /usr/share/nginx/html
