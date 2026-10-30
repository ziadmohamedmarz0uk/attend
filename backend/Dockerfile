FROM php:8.2-cli-alpine

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

WORKDIR /app

# Copy backend files
COPY . /app

# Enable concurrent worker processes for PHP CLI Server
ENV PHP_CLI_SERVER_WORKERS=4
ENV TZ=Africa/Cairo

# Expose default port
ENV PORT=8000
EXPOSE 8000

# Run PHP built-in web server with server.php as the application router
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8000} /app/server.php"]

