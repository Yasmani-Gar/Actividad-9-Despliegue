# Usar imagen oficial de Node.js
FROM node:18

# Establecer directorio de trabajo en backend
WORKDIR /app/backend

# Copiar archivos de package desde la carpeta backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install

# Instalar sqlite3 como dependencia global
RUN npm install -g sqlite3

# Copiar el resto de los archivos, incluyendo database.db
COPY backend/ .

# Exponer el puerto
EXPOSE 3000

# Copiar script de inicialización
COPY backend/init-db.sql /app/backend/init-db.sql
RUN sqlite3 database.db < /app/backend/init-db.sql

# Comando para iniciar la aplicación
CMD ["node", "server.js"]